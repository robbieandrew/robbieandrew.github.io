let tweetMap = new Map();
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

    const defaultTweets = tweets.slice(0, 20);
    // Set the initial history state so popstate can restore the timeline view
    history.replaceState({ view: 'timeline' }, '', '');
    renderTimeline(defaultTweets);
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
 * Also handles @mentions and #hashtags.
 */
function linkifyText(text) {
    // Escape any existing HTML entities first to prevent XSS
    text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // URLs (http/https)
    text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // @mentions
    text = text.replace(
        /@(\w+)/g,
        '<a href="https://twitter.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>'
    );

    // #hashtags
    text = text.replace(
        /#(\w+)/g,
        '<a href="https://twitter.com/hashtag/$1" target="_blank" rel="noopener noreferrer">#$1</a>'
    );

    return text;
}

function renderTimeline(tweetsToRender, pushToHistory = false) {
    currentViewTweets = tweetsToRender;
    const container = document.getElementById('tweet-container');
    container.innerHTML = '';

    if (pushToHistory) {
        history.pushState({ view: 'timeline' }, '', '');
    }

    tweetsToRender.forEach(t => {
        const tweet = t.tweet || t;
        const tweetDiv = document.createElement('div');

        tweetDiv.className = 'tweet is-clickable';
        tweetDiv.setAttribute('data-id', tweet.id_str);

        let mediaHtml = '';
        if (tweet.extended_entities && tweet.extended_entities.media) {
            tweet.extended_entities.media.forEach(m => {
                const imageUrl = getAssetUrl(tweet.id_str, m.media_url_https);
                mediaHtml += `<img src="${imageUrl}" class="graph-img">`;
            });
        }

        tweetDiv.innerHTML = `
            <div class="tweet-header">
                <img src="img/avatar.jpg" class="avatar" alt="profile">
                <div class="user-info">
                    <strong>Robbie Andrew</strong>
                    <span>@robbie_andrew</span>
                </div>
            </div>
            <div class="content">
                <p>${linkifyText(tweet.full_text)}</p>
                ${mediaHtml}
                <div class="date">${formatDate(tweet.created_at)}</div>
            </div>
        `;
        container.appendChild(tweetDiv);
    });
}


let debounceTimer;

document.getElementById('search-bar').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);

    const term = e.target.value.toLowerCase();

    if (term.length === 0) {
        renderTimeline(Array.from(tweetMap.values()).slice(0, 20));
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
        renderThreadView(fullThread);
    }
});

function renderThreadView(threadArray, pushToHistory = true) {
    if (pushToHistory) {
        history.pushState({ view: 'thread' }, '', '');
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
            tweetDiv.className = 'tweet thread-tweet';
            const tweet = item.tweet || item;

            let mediaHtml = '';
            if (tweet.extended_entities?.media) {
                tweet.extended_entities.media.forEach(m => {
                    const imageUrl = getAssetUrl(tweet.id_str, m.media_url_https);
                    mediaHtml += `<img src="${imageUrl}" class="graph-img">`;
                });
            }

            tweetDiv.innerHTML = `
                <div class="tweet-header">
                    <img src="img/avatar.jpg" class="avatar" alt="profile">
                    <div class="user-info">
                        <strong>Robbie Andrew</strong>
                        <span>@robbie_andrew</span>
                    </div>
                </div>
                <div class="content">
                    <p>${linkifyText(tweet.full_text)}</p>
                    ${mediaHtml}
                    <div class="date">${formatDate(tweet.created_at)}</div>
                </div>
                <div class="stats">
                    <div class="stat-item"><strong>${tweet.retweet_count || 0}</strong> Retweets</div>
                    <div class="stat-item"><strong>${tweet.favorite_count || 0}</strong> Likes</div>
                </div>
            `;
        }
        wrapper.appendChild(tweetDiv);
    });

    container.appendChild(wrapper);

    if (window.twttr) {
        window.twttr.widgets.load();
    }
}

window.addEventListener('popstate', (event) => {
    const state = event.state;
    if (!state || state.view === 'timeline') {
        // Going back to timeline (or forward to it)
        renderTimeline(currentViewTweets);
    }
    // If state.view === 'thread', the browser's forward button was pressed
    // but we don't re-fetch the thread here since we don't cache it.
    // The back button inside the thread view handles this gracefully.
});