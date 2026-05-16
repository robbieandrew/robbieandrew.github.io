let tweetMap = new Map();
let allTweets = [];         // Master copy of all tweets
let currentPageSource = []; // The full filtered/sorted list we're paginating through
let currentViewTweets = []; // Tracks tweets currently rendered on screen
let currentOffset = 0;      // How many tweets we've shown so far
const PAGE_SIZE = 20;
const ASSET_BASE = "https://raw.githubusercontent.com/robbieandrew/twitter_assets/main/";

let debounceTimer;  // Search timer

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

    allTweets = tweets.map(item => item.tweet);

    // Initialize Tom-Select
    tomSelect = new TomSelect('#sort-select', {
        create: false,
        controlInput: null,
        onChange: () => applyFiltersAndSort()
    });

    // Handle Home Link
    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('search-bar').value = '';
        history.pushState({ view: 'timeline' }, '', 'index.html');
        applyFiltersAndSort();
    });

    const params = new URLSearchParams(window.location.search);
    const tweetId = params.get('tweet');

    if (tweetId && tweetMap.has(tweetId)) {
        const fullThread = await fetchFullThread(tweetId);
        renderThreadView(fullThread, false, tweetId);
    } else {
        applyFiltersAndSort();
    }
}

function applyFiltersAndSort() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const sortVal = document.getElementById('sort-select').value;

    let results = allTweets.filter(t => t.full_text.toLowerCase().includes(term));

    if (sortVal === 'chrono') {
        results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortVal === 'reverse-chrono') {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortVal === 'popularity') {
        results.sort((a, b) => {
            const scoreA = (parseInt(a.retweet_count) || 0) + (parseInt(a.favorite_count) || 0);
            const scoreB = (parseInt(b.retweet_count) || 0) + (parseInt(b.favorite_count) || 0);
            return scoreB - scoreA;
        });
    }

    renderTimeline(results);
}

async function getExternalTweetEmbed(tweetId) {
    try {
        const url = `https://publish.twitter.com/oembed?url=https://twitter.com/x/status/${tweetId}&hide_thread=true&omit_script=true`;
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.html;
    } catch (e) {
        return `<div class="tweet external-error">
                  <a href="https://twitter.com/x/status/${tweetId}" target="_blank">View original on X.com</a>
                </div>`;
    }
}

async function fetchFullThread(targetTweetId) {
    let ancestors = [];
    let currentId = targetTweetId;

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
    // Strip query parameters (like ?tag=12) so we get the clean file extension
    const cleanUrl = originalUrl.split('?')[0];
    const originalFilename = cleanUrl.split('/').pop();
    const archiveFilename = `${tweetId}-${originalFilename}`;
    const prefix = archiveFilename.substring(0, 3);
    return `${ASSET_BASE}${prefix}/${archiveFilename}`;
}

function linkifyText(text, urlEntities = [], mediaEntities = []) {
    const urlMap = {};
    urlEntities.forEach(u => { urlMap[u.url] = u; });
    mediaEntities.forEach(m => { urlMap[m.url] = { display_url: 'pic.', expanded_url: '' }; });

    function linkifySegment(segment) {
        segment = segment.replace(/@(\w+)/g, '<a href="https://twitter.com/$1" target="_blank">@$1</a>');
        segment = segment.replace(/#(\w+)/g, '<a href="https://twitter.com/hashtag/$1" target="_blank">#$1</a>');
        return segment;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    while ((match = urlRegex.exec(escaped)) !== null) {
        if (match.index > lastIndex) parts.push(linkifySegment(escaped.slice(lastIndex, match.index)));
        const url = match[1];
        const entity = urlMap[url];
        if (entity && !entity.display_url.startsWith('pic.')) {
            const internalTweetMatch = entity.expanded_url.match(/(?:twitter\.com|x\.com)\/robbie_andrew\/status\/(\d+)/i);
            if (internalTweetMatch) {
                parts.push(`<a href="?tweet=${internalTweetMatch[1]}">${entity.display_url}</a>`);
            } else {
                parts.push(`<a href="${entity.expanded_url}" target="_blank">${entity.display_url}</a>`);
            }
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < escaped.length) parts.push(linkifySegment(escaped.slice(lastIndex)));
    return parts.join('');
}

function getThreadInfo(tweet) {
    const hasReplies = Array.from(tweetMap.values()).some(t => t.in_reply_to_status_id_str === tweet.id_str);
    const isOwnReply = tweet.in_reply_to_status_id_str && tweetMap.has(tweet.in_reply_to_status_id_str);
    return { hasReplies, isOwnReply };
}

function renderTweet(tweet, { inThread = false } = {}) {
    const tweetDiv = document.createElement('div');
    tweetDiv.className = inThread ? 'tweet thread-tweet' : 'tweet is-clickable';
    if (!inThread) tweetDiv.setAttribute('data-id', tweet.id_str);

    let mediaHtml = '';
    if (tweet.extended_entities?.media) {
        tweet.extended_entities.media.forEach(m => {
            if (m.type === 'video' || m.type === 'animated_gif') {
                // Filter for MP4 variants
                const mp4Variants = m.video_info?.variants?.filter(v => v.content_type === 'video/mp4') || [];
                
                if (mp4Variants.length > 0) {
                    // Sort by bitrate descending to ensure you get the highest quality variant
                    mp4Variants.sort((a, b) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));
                    const videoUrl = mp4Variants[0].url;
                    
					mediaHtml += `
						<video controls autoplay loop muted playsinline class="graph-video" style="max-width: 100%; margin-top: 10px; display: block; border-radius: 8px;">
							<source src="${getAssetUrl(tweet.id_str, videoUrl)}" type="video/mp4">
							Your browser does not support the video tag.
						</video>`;
				} else {
                    // Fallback to thumbnail image if no mp4 variant is found
                    mediaHtml += `<img src="${getAssetUrl(tweet.id_str, m.media_url_https)}" class="graph-img">`;
                }
            } else {
                // Standard image rendering
                mediaHtml += `<img src="${getAssetUrl(tweet.id_str, m.media_url_https)}" class="graph-img">`;
            }
        });
    }

    let threadBadgeHtml = '';
    if (!inThread) {
        const info = getThreadInfo(tweet);
        if (info.hasReplies || info.isOwnReply) threadBadgeHtml = '<span class="thread-badge">Thread</span>';
    }

    tweetDiv.innerHTML = `
        <div class="tweet-header">
            <img src="img/avatar.jpg" class="avatar" alt="profile">
            <div class="user-info"><strong>Robbie Andrew</strong><span>@robbie_andrew</span></div>
            ${threadBadgeHtml}
        </div>
        <div class="content">
            <p>${linkifyText(tweet.full_text, tweet.entities?.urls, tweet.entities?.media)}</p>
            ${mediaHtml}
            <div class="date">${formatDate(tweet.created_at)}</div>
        </div>
        <div class="stats">
            <div class="stat-item"><strong>${tweet.retweet_count || 0}</strong> Retweets</div>
            <div class="stat-item"><strong>${tweet.favorite_count || 0}</strong> Likes</div>
        </div>`;
    return tweetDiv;
}

function renderTimeline(tweetsToRender) {
    currentPageSource = tweetsToRender;
    currentViewTweets = [];
    currentOffset = 0;
    const container = document.getElementById('tweet-container');
    container.innerHTML = '';
    appendTweets(PAGE_SIZE, container);
}

function appendTweets(count, container) {
    container = container || document.getElementById('tweet-container');
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
        btn.onclick = () => appendTweets(PAGE_SIZE);
        container.appendChild(btn);
    }
}

// Listeners
document.getElementById('search-bar').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => applyFiltersAndSort(), 300);
});

document.getElementById('tweet-container').addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')?.startsWith('?tweet=')) {
        e.preventDefault();
        const tweetId = new URLSearchParams(link.getAttribute('href')).get('tweet');
        renderThreadView(await fetchFullThread(tweetId), true, tweetId);
        return;
    }

    const tweetEl = e.target.closest('.tweet.is-clickable');
    if (tweetEl) {
        const tweetId = tweetEl.getAttribute('data-id');
        renderThreadView(await fetchFullThread(tweetId), true, tweetId);
    }
});

function renderThreadView(threadArray, pushToHistory = true, tweetId = null) {
    if (pushToHistory) history.pushState({ view: 'thread', tweetId }, '', tweetId ? `?tweet=${tweetId}` : '');
    const container = document.getElementById('tweet-container');
    container.innerHTML = '<button onclick="history.back()" class="back-btn">← Back</button>';
    const wrapper = document.createElement('div');
    wrapper.className = 'thread-wrapper';
    threadArray.forEach(item => {
        if (item.isExternal) {
            const div = document.createElement('div');
            div.className = 'external-tweet';
            div.innerHTML = item.html;
            wrapper.appendChild(div);
        } else {
            wrapper.appendChild(renderTweet(item, { inThread: true }));
        }
    });
    container.appendChild(wrapper);
    if (window.twttr) window.twttr.widgets.load();
}

window.addEventListener('popstate', async (event) => {
    const state = event.state;
    if (!state || state.view === 'timeline') {
        renderTimeline(currentPageSource);
    } else if (state.view === 'thread' && state.tweetId) {
        renderThreadView(await fetchFullThread(state.tweetId), false, state.tweetId);
    }
});

init();