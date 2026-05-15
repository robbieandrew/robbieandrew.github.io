let tweetMap = new Map();
let currentPageSource = []; // The full filtered/sorted list we're paginating through
let currentOffset = 0;      // How many tweets we've shown so far
const PAGE_SIZE = 20;
let currentViewTweets = []; // Store whatever is currently in the timeline
const ASSET_BASE = "https://raw.githubusercontent.com/robbieandrew/twitter_assets/main/";

function formatDate(createdAt) {
    const date = new Date(createdAt);
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${time} · ${day}`;
}

async function init() {
    const response = await fetch('tweets.json');
    const tweets = await response.json();

    tweets.forEach(item => {
        tweetMap.set(item.tweet.id_str, item.tweet);
    });

    const allTweets = tweets.map(item => item.tweet);

    const params = new URLSearchParams(window.location.search);
    const tweetId = params.get('tweet');

    if (tweetId && tweetMap.has(tweetId)) {
        // Arrived via a direct link — load the thread without pushing a new history entry
        currentViewTweets = allTweets.slice(0, PAGE_SIZE); // So Back returns to a sensible timeline
        history.replaceState({ view: 'thread', tweetId }, '', `?tweet=${tweetId}`);
        const fullThread = await fetchFullThread(tweetId);
        renderThreadView(fullThread, false);
    } else {
        history.replaceState({ view: 'timeline' }, '', '');
        renderTimeline(allTweets);
    }
}

async function getExternalTweetEmbed(tweetId) {
    try {
        const url = `https://publish.twitter.com/oembed?url=https://twitter.com/x/status/${tweetId}&hide_thread=true&omit_script=true`;
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.html;
    } catch (e) {
        return `<div class="tweet external-error">
                  <a href="https://twitter.com/x/status/${tweetId}" target="_blank">
                    View original parent tweet on X.com
                  </a>
                </div>`;
    }
}

async function fetchFullThread(targetTweetId) {
    let ancestors = [];
    let currentId = targetTweetId;

    // 1. CLIMB UP (Find all parents)
    while (currentId) {
        let tweet = tweetMap.get(currentId);
        if (tweet) {
            ancestors.unshift(tweet);
            currentId = tweet.in_reply_to_status_id_str;
        } else {
            const externalHtml = await getExternalTweetEmbed(currentId);
            ancestors.unshift({ isExternal: true, html: externalHtml });
            break;
        }
    }

    // 2. CLIMB DOWN (Find all nested replies)
    let descendants = [];
    let queue = [targetTweetId];

    while (queue.length > 0) {
        let parentId = queue.shift();
        let replies = Array.from(tweetMap.values())
            .filter(t => t.in_reply_to_status_id_str === parentId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        replies.forEach(reply => {
            descendants.push(reply);
            queue.push(reply.id_str);
        });
    }

    const fullConversation = [...ancestors, ...descendants];
    const uniqueMap = new Map();
    fullConversation.forEach(t => uniqueMap.set(t.id_str || 'ext-' + Math.random(), t));

    return Array.from(uniqueMap.values());
}

function getAssetUrl(tweetId, originalUrl) {
    const originalFilename = originalUrl.split('/').pop();
    const archiveFilename = `${tweetId}-${originalFilename}`;
    const prefix = archiveFilename.substring(0, 3);
    return `${ASSET_BASE}${prefix}/${archiveFilename}`;
}

/**
 * Converts plain-text URLs in tweet text into clickable <a> tags.
 * Uses the tweet's entities.urls to replace t.co shortlinks with real display URLs.
 * Also handles @mentions and #hashtags.
 *
 * Processes text in segments so that @mentions and #hashtags inside URLs
 * (e.g. a #fragment in an href) are never double-processed.
 */
function linkifyText(text, urlEntities = [], mediaEntities = []) {
    // Build a lookup from t.co URL -> { expanded_url, display_url }
    const urlMap = {};
    urlEntities.forEach(u => { urlMap[u.url] = u; });
    // Media t.co links should be suppressed — the image renders below the text
    mediaEntities.forEach(m => { urlMap[m.url] = { display_url: 'pic.', expanded_url: '' }; });

    // Helper: apply @mention and #hashtag linkification to a plain-text segment only
    function linkifySegment(segment) {
        segment = segment.replace(
            /@(\w+)/g,
            '<a href="https://twitter.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>'
        );
        segment = segment.replace(
            /#(\w+)/g,
            '<a href="https://twitter.com/hashtag/$1" target="_blank" rel="noopener noreferrer">#$1</a>'
        );
        return segment;
    }

    // Split text into alternating [plain, url, plain, url, ...] segments
    // so we only run mention/hashtag replacement on the plain parts
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Escape HTML in the full raw text first
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    while ((match = urlRegex.exec(escaped)) !== null) {
        // Plain text before this URL
        if (match.index > lastIndex) {
            parts.push(linkifySegment(escaped.slice(lastIndex, match.index)));
        }

        // The URL itself
        const url = match[1];
        const entity = urlMap[url];
        if (entity) {
            if (entity.display_url.startsWith('pic.')) {
                // Suppress media attachment links entirely
            } else {
                parts.push(`<a href="${entity.expanded_url}" target="_blank" rel="noopener noreferrer">${entity.display_url}</a>`);
            }
        } else {
            parts.push(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        }

        lastIndex = match.index + match[0].length;
    }

    // Any remaining plain text after the last URL
    if (lastIndex < escaped.length) {
        parts.push(linkifySegment(escaped.slice(lastIndex)));
    }

    return parts.join('');
}

/**
 * Returns true if this tweet has replies in the archive,
 * or is itself a reply to another of our own tweets.
 */
function getThreadInfo(tweet) {
    const hasReplies = Array.from(tweetMap.values())
        .some(t => t.in_reply_to_status_id_str === tweet.id_str);
    const isReply = !!tweet.in_reply_to_status_id_str;
    const isOwnReply = isReply && tweetMap.has(tweet.in_reply_to_status_id_str);
    return { hasReplies, isReply, isOwnReply };
}

/**
 * Renders a single tweet as a DOM element.
 * @param {object} tweet - The raw tweet object.
 * @param {object} options
 * @param {boolean} options.inThread - Applies thread styling and removes click-to-expand.
 */
function renderTweet(tweet, { inThread = false } = {}) {
    const tweetDiv = document.createElement('div');
    tweetDiv.className = inThread ? 'tweet thread-tweet' : 'tweet is-clickable';
    if (!inThread) tweetDiv.setAttribute('data-id', tweet.id_str);

    let mediaHtml = '';
    if (tweet.extended_entities?.media) {
        tweet.extended_entities.media.forEach(m => {
            const imageUrl = getAssetUrl(tweet.id_str, m.media_url_https);
            mediaHtml += `<img src="${imageUrl}" class="graph-img">`;
        });
    }

    const urlEntities = tweet.entities?.urls || [];
    const mediaEntities = tweet.entities?.media || [];

    // Thread indicator (only on timeline, not inside a thread view)
    let threadBadgeHtml = '';
    if (!inThread) {
        const { hasReplies, isOwnReply } = getThreadInfo(tweet);
        if (hasReplies || isOwnReply) {
            threadBadgeHtml = '<span class="thread-badge">Thread</span>';
        }
    }

    tweetDiv.innerHTML = `
        <div class="tweet-header">
            <img src="img/avatar.jpg" class="avatar" alt="profile">
            <div class="user-info">
                <strong>Robbie Andrew</strong>
                <span>@robbie_andrew</span>
            </div>
            ${threadBadgeHtml}
        </div>
        <div class="content">
            <p>${linkifyText(tweet.full_text, urlEntities, mediaEntities)}</p>
            ${mediaHtml}
            <div class="date">${formatDate(tweet.created_at)}</div>
        </div>
        <div class="stats">
            <div class="stat-item"><strong>${tweet.retweet_count || 0}</strong> Retweets</div>
            <div class="stat-item"><strong>${tweet.favorite_count || 0}</strong> Likes</div>
        </div>
    `;
    return tweetDiv;
}

function renderTimeline(tweetsToRender, pushToHistory = false) {
    currentPageSource = tweetsToRender;
    currentViewTweets = [];
    currentOffset = 0;
    const container = document.getElementById('tweet-container');
    container.innerHTML = '';

    if (pushToHistory) {
        history.pushState({ view: 'timeline' }, '', '');
    }

    appendTweets(PAGE_SIZE, container);
}

function appendTweets(count, container) {
    container = container || document.getElementById('tweet-container');
    // Remove existing load-more button if present
    const existing = container.querySelector('.load-more-btn');
    if (existing) existing.remove();

    const slice = currentPageSource.slice(currentOffset, currentOffset + count);
    slice.forEach(t => {
        const tweet = t.tweet || t;
        currentViewTweets.push(tweet);
        container.appendChild(renderTweet(tweet));
    });
    currentOffset += slice.length;

    if (currentOffset < currentPageSource.length) {
        const btn = document.createElement('button');
        btn.className = 'load-more-btn';
        btn.textContent = `Load more (${currentPageSource.length - currentOffset} remaining)`;
        btn.addEventListener('click', () => appendTweets(PAGE_SIZE));
        container.appendChild(btn);
    }
}


let debounceTimer;

document.getElementById('search-bar').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);

    const term = e.target.value.toLowerCase();

    if (term.length === 0) {
        renderTimeline(Array.from(tweetMap.values()));
        return;
    }

    if (term.length < 3) return;

    debounceTimer = setTimeout(() => {
        const filtered = Array.from(tweetMap.values())
            .filter(t => t.full_text.toLowerCase().includes(term));

        renderTimeline(filtered);
    }, 300);
});

init();

document.getElementById('tweet-container').addEventListener('click', async (e) => {
    // Don't trigger thread view when clicking a link inside a tweet
    if (e.target.tagName === 'A') return;

    const tweetEl = e.target.closest('.tweet');

    if (tweetEl && tweetEl.classList.contains('is-clickable')) {
        const tweetId = tweetEl.getAttribute('data-id');
        tweetEl.style.opacity = '0.5';

        const fullThread = await fetchFullThread(tweetId);
        renderThreadView(fullThread, true, tweetId);
    }
});

function renderThreadView(threadArray, pushToHistory = true, tweetId = null) {
    if (pushToHistory) {
        const url = tweetId ? `?tweet=${tweetId}` : '';
        history.pushState({ view: 'thread', tweetId }, '', url);
    }

    const container = document.getElementById('tweet-container');
    container.innerHTML = '<button onclick="history.back()" class="back-btn">← Back</button>';

    const wrapper = document.createElement('div');
    wrapper.className = 'thread-wrapper';

    threadArray.forEach(item => {
        const tweetDiv = document.createElement('div');

        if (item.isExternal) {
            tweetDiv.className = 'external-tweet';
            tweetDiv.innerHTML = item.html;
        } else {
            wrapper.appendChild(renderTweet(item.tweet || item, { inThread: true }));
            return;
        }
        wrapper.appendChild(tweetDiv);
    });

    container.appendChild(wrapper);

    if (window.twttr) {
        window.twttr.widgets.load();
    }
}

window.addEventListener('popstate', async (event) => {
    const state = event.state;
    if (!state || state.view === 'timeline') {
        renderTimeline(currentPageSource);
    } else if (state.view === 'thread' && state.tweetId) {
        // Forward navigation back into a thread — re-fetch and render it
        const fullThread = await fetchFullThread(state.tweetId);
        renderThreadView(fullThread, false, state.tweetId);
    }
});