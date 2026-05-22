/* twitter_archive.js by Robbie Andrew with AI help, May 2026 */

// --- Configuration ------------------------------------------------------------

const TWITTER_HANDLE    = 'robbie_andrew';        // Twitter/X handle (lowercase)
const DISPLAY_NAME   = 'Robbie Andrew';           // Display name shown in the UI
const AVATAR_SRC     = 'img/avatar.jpg';          // Path to profile avatar image

// --- State --------------------------------------------------------------------

let tweetMap = new Map(); // id_str → tweet object; used for O(1) lookups by tweet ID
let allTweets = [];         // Master copy of every tweet loaded from tweets.json
let currentPageSource = []; // The full filtered/sorted list currently being paginated
let currentViewTweets = []; // Tweets that have been rendered to the page so far
let currentOffset = 0;      // Index into currentPageSource marking where the next page starts
const PAGE_SIZE = 20;       // Number of tweets to render per "Load more" page
const ASSET_BASE = "https://raw.githubusercontent.com/robbieandrew/twitter_assets/main/";

let debounceTimer; // Holds the setTimeout ID used to debounce search-bar input

// --- Helpers ------------------------------------------------------------------

// Formats a tweet's creation timestamp into a human-readable string,
// e.g. "3:45 PM · Jan 12, 2022".
function formatDate(createdAt) {
    const date = new Date(createdAt);
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${time} · ${day}`;
}

// --- Initialisation -----------------------------------------------------------

// Entry point: fetches tweet data, sets up UI controls, and renders the initial view.
// If the page URL contains a ?tweet= parameter, opens that tweet's thread directly;
// otherwise renders the default timeline.
async function init() {
    const response = await fetch('tweets.json');
    const tweets = await response.json();

    // Populate the lookup map and flat array from the loaded tweet objects
    tweets.forEach(item => {
        tweetMap.set(item.tweet.id_str, item.tweet);
    });
    allTweets = tweets.map(item => item.tweet);

    // Initialise the Tom-Select dropdown for sort order; re-sort whenever the value changes
    tomSelect = new TomSelect('#sort-select', {
        create: false,
        controlInput: null,
        onChange: () => applyFiltersAndSort()
    });

    // Clicking the home link clears the search field and returns to the full timeline
    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('search-bar').value = '';
        history.pushState({ view: 'timeline' }, '', 'index.html');
        applyFiltersAndSort();
		window.scrollTo(0, 0);
    });

    // Check whether the page was loaded with a specific tweet requested via ?tweet=<id>
    const params = new URLSearchParams(window.location.search);
    const tweetId = params.get('tweet');

	if (tweetId && tweetMap.has(tweetId)) {
		// Push a timeline entry beneath the thread so the back button returns to it
		history.replaceState({ view: 'timeline' }, '', 'index.html');
		const fullThread = await fetchFullThread(tweetId);
		renderThreadView(fullThread, true, tweetId);  // pushToHistory = true
	} else {
		history.replaceState({ view: 'timeline' }, '', window.location.href);
		applyFiltersAndSort();
	}
}

// --- Filtering & Sorting ------------------------------------------------------

// Reads the current search term and sort selection, filters allTweets to those
// whose text contains the term, sorts the results accordingly, then re-renders
// the timeline from scratch.
function applyFiltersAndSort() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const sortVal = document.getElementById('sort-select').value;

    let results = allTweets.filter(t => t.full_text.toLowerCase().includes(term));

    if (sortVal === 'chrono') {
        results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortVal === 'reverse-chrono') {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortVal === 'popularity') {
        // Rank by combined retweet + like count, highest first
        results.sort((a, b) => {
            const scoreA = (parseInt(a.retweet_count) || 0) + (parseInt(a.favorite_count) || 0);
            const scoreB = (parseInt(b.retweet_count) || 0) + (parseInt(b.favorite_count) || 0);
            return scoreB - scoreA;
        });
    }

    renderTimeline(results);
}

// --- External Tweet Embedding -------------------------------------------------

// Fetches an oEmbed HTML snippet for a tweet that isn't in the local archive.
// Falls back to a styled error card with a link to X.com if the request fails
// (e.g. due to CORS, rate limiting, or the tweet being deleted).
// contextTweet is the local tweet that links to this external one; its
// in_reply_to_screen_name is used to build a better fallback card.
async function getExternalTweetEmbed(tweetId, contextTweet = null) {
    const tweetUrl = contextTweet?.in_reply_to_screen_name
        ? `https://x.com/${contextTweet.in_reply_to_screen_name}/status/${tweetId}`
        : `https://x.com/i/status/${tweetId}`;

    return `<blockquote class="twitter-tweet" data-conversation="none">
        <a href="${tweetUrl}"></a>
    </blockquote>`;
}

// --- Thread Construction ------------------------------------------------------

// Builds the full conversation containing targetTweetId by walking both
// directions of the reply chain:
//   • Ancestors  – follows in_reply_to_status_id_str upward until reaching
//                  the root tweet or a tweet not in the local archive
//                  (in which case an oEmbed placeholder is prepended).
//   • Descendants – BFS through all local replies below targetTweetId,
//                   sorted chronologically at each level.
// Returns a de-duplicated ordered array of tweet objects (plus any external
// placeholder objects with { isExternal, html }).
async function fetchFullThread(targetTweetId) {
    // Walk up the reply chain to collect ancestor tweets
    let ancestors = [];
    let currentId = targetTweetId;

    while (currentId) {
        let tweet = tweetMap.get(currentId);
        if (tweet) {
            ancestors.unshift(tweet); // prepend to keep chronological order
            currentId = tweet.in_reply_to_status_id_str;
        } else {
            // Tweet not in local archive — fetch an external embed and stop climbing
            const externalHtml = await getExternalTweetEmbed(currentId, ancestors[0] || null);
            ancestors.unshift({ isExternal: true, html: externalHtml });
            break;
        }
    }

    // BFS downward to collect all replies below the target tweet
    let descendants = [];
    let queue = [targetTweetId];
    while (queue.length > 0) {
        let parentId = queue.shift();
        let replies = Array.from(tweetMap.values())
            .filter(t => t.in_reply_to_status_id_str === parentId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        replies.forEach(reply => {
            descendants.push(reply);
            queue.push(reply.id_str); // enqueue each reply so its own replies are found
        });
    }

    // Merge and de-duplicate (external items get a random key since they lack id_str)
    const fullConversation = [...ancestors, ...descendants];
    const uniqueMap = new Map();
    fullConversation.forEach(t => uniqueMap.set(t.id_str || 'ext-' + Math.random(), t));
    return Array.from(uniqueMap.values());
}

// --- Asset URLs ---------------------------------------------------------------

// Constructs the GitHub raw URL for a locally archived media file.
// Files are organised into sub-directories by the first 3 characters of their
// archive filename (e.g. "123" → "123/123456789-photo.jpg") to keep folder
// sizes manageable.
function getAssetUrl(tweetId, originalUrl) {
    // Strip query parameters (like ?tag=12) to get the clean file extension
    const cleanUrl = originalUrl.split('?')[0];
    const originalFilename = cleanUrl.split('/').pop();
    const archiveFilename = `${tweetId}-${originalFilename}`;
    const prefix = archiveFilename.substring(0, 3);
    return `${ASSET_BASE}${prefix}/${archiveFilename}`;
}

// --- Text Processing ----------------------------------------------------------

// Converts raw tweet text into HTML by:
//   1. HTML-escaping special characters to prevent injection.
//   2. Expanding Twitter's t.co short URLs using the tweet's URL entities:
//      - Own tweet links  → internal ?tweet= links for SPA navigation.
//      - Other users' tweet links → tagged ?external-tweet= links so the
//        caller can later replace them with oEmbed content.
//      - All other URLs   → standard external links.
//      - Media URLs (pic.twitter.com) → suppressed (shown via media embeds).
//   3. Linkifying @mentions and #hashtags in the remaining plain-text segments.
function linkifyText(text, urlEntities = [], mediaEntities = []) {
    // Build a lookup from short t.co URL → entity metadata
    const urlMap = {};
    urlEntities.forEach(u => { urlMap[u.url] = u; });
    // Media URLs should be suppressed in body text (they appear as inline media instead)
    mediaEntities.forEach(m => { urlMap[m.url] = { display_url: 'pic.', expanded_url: '' }; });

    // Convert @mentions and #hashtags within a plain-text segment into links
    function linkifySegment(segment) {
        segment = segment.replace(/@(\w+)/g, '<a href="https://twitter.com/$1" target="_blank">@$1</a>');
        segment = segment.replace(/#(\w+)/g, '<a href="https://twitter.com/hashtag/$1" target="_blank">#$1</a>');
        return segment;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    // Escape HTML entities before processing so injected content is safe
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    while ((match = urlRegex.exec(escaped)) !== null) {
        // Linkify any plain text that appeared before this URL
        if (match.index > lastIndex) parts.push(linkifySegment(escaped.slice(lastIndex, match.index)));
        const url = match[1];
        const entity = urlMap[url];
        if (entity && !entity.display_url.startsWith('pic.')) {
		// Check if the expanded URL points to a tweet (twitter.com or x.com)
		const internalTweetMatch = entity.expanded_url.match(
			/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/i
		);
		if (internalTweetMatch) {
			const [, username, statusId] = internalTweetMatch;
			if (username.toLowerCase() === TWITTER_HANDLE) {
				// Own tweet — link within the archive for SPA navigation
				parts.push(`<a href="?tweet=${statusId}">${entity.display_url}</a>`);
			} else {
				// Another user's tweet — tag for deferred oEmbed replacement
				parts.push(`<a href="?external-tweet=${statusId}" data-external-author="${username}">${entity.display_url}</a>`);
			}
		} else {
			// Regular external link
			parts.push(`<a href="${entity.expanded_url}" target="_blank">${entity.display_url}</a>`);
		}
        }
        lastIndex = match.index + match[0].length;
    }
    // Linkify any trailing plain text after the last URL
    if (lastIndex < escaped.length) parts.push(linkifySegment(escaped.slice(lastIndex)));
    return parts.join('');
}

// --- Thread Badge -------------------------------------------------------------

// Determines whether a tweet belongs to a thread so a badge can be shown.
// hasReplies  – at least one other tweet in the archive replies to this one.
// isOwnReply  – this tweet itself is a reply to another tweet in the archive.
function getThreadInfo(tweet) {
    const hasReplies = Array.from(tweetMap.values()).some(t => t.in_reply_to_status_id_str === tweet.id_str);
    const isOwnReply = tweet.in_reply_to_status_id_str && tweetMap.has(tweet.in_reply_to_status_id_str);
    return { hasReplies, isOwnReply };
}

// --- Tweet Rendering ----------------------------------------------------------

// Creates and returns a DOM element for a single tweet.
// When inThread is false (timeline view), the element is clickable and carries
// a data-id attribute for event delegation. When inThread is true, it is
// rendered as a non-clickable thread item.
// After building the HTML skeleton, inline quote links are replaced with
// rendered insets (own tweets) or async oEmbed placeholders (external tweets).
function renderTweet(tweet, { inThread = false } = {}) {
    const tweetDiv = document.createElement('div');
    tweetDiv.className = inThread ? 'tweet thread-tweet' : 'tweet is-clickable';
    if (!inThread) tweetDiv.setAttribute('data-id', tweet.id_str);

    // Build media HTML: videos/GIFs get a <video> element using the highest-bitrate
    // MP4 variant; images get a zoomable <img> that triggers the lightbox on click.
    let mediaHtml = '';
    if (tweet.extended_entities?.media) {
        tweet.extended_entities.media.forEach(m => {
            if (m.type === 'video' || m.type === 'animated_gif') {
                const mp4Variants = m.video_info?.variants?.filter(v => v.content_type === 'video/mp4') || [];
                if (mp4Variants.length > 0) {
                    // Sort variants descending by bitrate and pick the best quality
                    mp4Variants.sort((a, b) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));
                    const videoUrl = mp4Variants[0].url;
                    mediaHtml += `
                        <video controls autoplay loop muted playsinline class="graph-video" style="max-width: 100%; margin-top: 10px; display: block; border-radius: 8px;">
                            <source src="${getAssetUrl(tweet.id_str, videoUrl)}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>`;
                } else {
                    // No MP4 variant available; fall back to the thumbnail image
                    mediaHtml += `<img src="${getAssetUrl(tweet.id_str, m.media_url_https)}" class="graph-img">`;
                }
            } else {
                mediaHtml += `<img src="${getAssetUrl(tweet.id_str, m.media_url_https)}" class="graph-img" style="cursor: zoom-in;">`;
            }
        });
    }

    // Show a "Thread" badge on timeline cards that are part of a multi-tweet thread
    let threadBadgeHtml = '';
    if (!inThread) {
        const info = getThreadInfo(tweet);
        if (info.hasReplies || info.isOwnReply) threadBadgeHtml = '<span class="thread-badge">Thread</span>';
    }

    tweetDiv.innerHTML = `
        <div class="tweet-header">
            <img src="${AVATAR_SRC}" class="avatar" alt="profile">
            <div class="user-info"><strong>${DISPLAY_NAME}</strong><span>@${TWITTER_HANDLE}</span></div>
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

    // Wire up lightbox for each inline image (stopPropagation prevents the
    // tweet click handler from also firing and opening the thread view)
	tweetDiv.querySelectorAll('.graph-img').forEach(img => {
		img.addEventListener('click', (e) => {
			e.stopPropagation();
			openLightbox(img.src);
		});
	});

    const contentDiv = tweetDiv.querySelector('.content');

    // Replace internal ?tweet= anchor links with rendered quote-tweet insets
    const internalLinks = contentDiv.querySelectorAll('a[href^="?tweet="]');
    internalLinks.forEach(link => {
        const quotedId = new URLSearchParams(link.getAttribute('href')).get('tweet');
        const quotedTweet = tweetMap.get(quotedId);
        if (quotedTweet) {
            link.replaceWith(renderQuoteTweetInset(quotedTweet));
        }
    });

    // Replace external ?external-tweet= links with async oEmbed embeds.
    // A loading placeholder is shown immediately while the fetch resolves;
    // if the fetch fails the placeholder is replaced with a fallback link.
    const externalLinks = contentDiv.querySelectorAll('a[href^="?external-tweet="]');
    externalLinks.forEach(link => {
        const quotedId = new URLSearchParams(link.getAttribute('href')).get('external-tweet');
        const author = link.getAttribute('data-external-author') || 'unknown';

        const placeholder = document.createElement('div');
        placeholder.className = 'quote-tweet-external';
        placeholder.innerHTML = `
            <div class="quote-header">
                <span>@${author}</span>
                <span class="quote-date">· Loading…</span>
            </div>
            <div class="quote-body"><p>Loading quoted tweet…</p></div>`;
        link.replaceWith(placeholder);

        getExternalTweetEmbed(quotedId).then(html => {
            const wrapper = document.createElement('div');
            wrapper.className = 'quote-tweet-external';
            wrapper.innerHTML = html;
            placeholder.replaceWith(wrapper);
            // Ask Twitter's widget script to render any newly added embed HTML
            if (window.twttr) window.twttr.widgets.load(wrapper);
        }).catch(() => {
            placeholder.innerHTML = `
                <div class="quote-body">
                    <a href="https://x.com/${author}/status/${quotedId}" target="_blank">
                        View @${author}'s tweet on X
                    </a>
                </div>`;
        });
    });

    return tweetDiv;
}

// --- Timeline Rendering --------------------------------------------------------

// Replaces the timeline container with a fresh page of tweets from tweetsToRender,
// resetting pagination state so subsequent "Load more" clicks page through the
// new list from the beginning.
function renderTimeline(tweetsToRender) {
    currentPageSource = tweetsToRender;
    currentViewTweets = [];
    currentOffset = 0;
    const container = document.getElementById('tweet-container');
    container.innerHTML = '';
    appendTweets(PAGE_SIZE, container);
}

// Appends the next `count` tweets from currentPageSource to the container
// and updates the pagination offset. If more tweets remain after this batch,
// a "Load more" button is appended showing the remaining count.
function appendTweets(count, container) {
    container = container || document.getElementById('tweet-container');
    // Remove any existing "Load more" button before adding the new batch
    const existing = container.querySelector('.load-more-btn');
    if (existing) existing.remove();

    const slice = currentPageSource.slice(currentOffset, currentOffset + count);
    slice.forEach(t => {
        const tweet = t.tweet || t; // handle both raw tweets and wrapped {tweet: …} objects
        currentViewTweets.push(tweet);
        container.appendChild(renderTweet(tweet));
    });
    currentOffset += slice.length;

    if (currentOffset < currentPageSource.length) {
        const btn = document.createElement('button');
        btn.className = 'load-more-btn';
        btn.textContent = `Load ${PAGE_SIZE} more (${currentPageSource.length - currentOffset} remaining)`;
        btn.onclick = () => appendTweets(PAGE_SIZE);
        container.appendChild(btn);
    }
}

// --- Event Listeners ----------------------------------------------------------

// Debounce search input so applyFiltersAndSort only fires 300 ms after
// the user stops typing, avoiding excessive re-renders on every keystroke.
document.getElementById('search-bar').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => applyFiltersAndSort(), 300);
});

// Delegate all clicks within the tweet container to handle two cases:
//   1. A ?tweet= link inside a tweet body → open that tweet's thread view.
//   2. A click on the tweet card itself (.is-clickable) → open that tweet's thread view.
// Image clicks are excluded here because the lightbox handler uses stopPropagation.
document.getElementById('tweet-container').addEventListener('click', async (e) => {
    // Lightbox handles image clicks separately; ignore them here
    if (e.target.closest('img.graph-img')) return;

    const link = e.target.closest('a');
    if (link) {
        if (link.getAttribute('href')?.startsWith('?tweet=')) {
            e.preventDefault();
            const tweetId = new URLSearchParams(link.getAttribute('href')).get('tweet');
            renderThreadView(await fetchFullThread(tweetId), true, tweetId);
        }
        return; // Let all other links (external, hashtags, etc.) navigate normally
    }

    const tweetEl = e.target.closest('.tweet.is-clickable');
    if (tweetEl) {
        const tweetId = tweetEl.getAttribute('data-id');
        renderThreadView(await fetchFullThread(tweetId), true, tweetId);
    }
});

// --- Thread View ---------------------------------------------------------------

// Replaces the tweet container with a full thread view for threadArray.
// Prepends a Back button for navigation. External placeholder items (tweets not
// in the local archive) are rendered from their pre-fetched HTML directly.
// pushToHistory controls whether a new browser history entry is created.
function renderThreadView(threadArray, pushToHistory = true, tweetId = null) {
    if (pushToHistory) {
        history.pushState({ view: 'thread', tweetId }, '', tweetId ? `?tweet=${tweetId}` : '');
    }
    const container = document.getElementById('tweet-container');
    container.innerHTML = '<button onclick="history.back()" class="back-btn">← Back</button>';
    const wrapper = document.createElement('div');
    wrapper.className = 'thread-wrapper';
    threadArray.forEach(item => {
        if (item.isExternal) {
            // External tweets were already fetched as raw HTML by fetchFullThread
            const div = document.createElement('div');
            div.className = 'external-tweet';
            div.innerHTML = item.html;
            wrapper.appendChild(div);
        } else {
            wrapper.appendChild(renderTweet(item, { inThread: true }));
        }
    });
    container.appendChild(wrapper);
    // Ask Twitter's widget script to render any embedded tweet HTML in the thread
    if (window.twttr) window.twttr.widgets.load();
}

// --- Quote Tweet Inset ---------------------------------------------------------

// Builds a compact inset card for a quoted tweet from the local archive.
// Clicking the inset navigates into that tweet's thread view.
// Only used for own tweets; external quote tweets use oEmbed.
function renderQuoteTweetInset(quotedTweet) {
    const div = document.createElement('div');
    div.className = 'quote-tweet-inset';
    div.setAttribute('data-id', quotedTweet.id_str);

    const text = linkifyText(
        quotedTweet.full_text,
        quotedTweet.entities?.urls,
        quotedTweet.entities?.media
    );

    let mediaHtml = '';
    if (quotedTweet.extended_entities?.media) {
        quotedTweet.extended_entities.media.forEach(m => {
            mediaHtml += `<img src="${getAssetUrl(quotedTweet.id_str, m.media_url_https)}" class="graph-img">`;
        });
    }

    div.innerHTML = `
        <div class="quote-header">
            <img src="${AVATAR_SRC}" class="avatar avatar-sm" alt="profile">
            <strong>${DISPLAY_NAME}</strong>
            <span>@${TWITTER_HANDLE}</span>
            <span class="quote-date">· ${formatDate(quotedTweet.created_at)}</span>
        </div>
        <div class="quote-body">
            <p>${text}</p>
            ${mediaHtml}
        </div>`;

    div.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent the parent tweet card from also handling this click
        const fullThread = await fetchFullThread(quotedTweet.id_str);
        renderThreadView(fullThread, true, quotedTweet.id_str);
    });

    return div;
}

// --- Lightbox -----------------------------------------------------------------

// Creates and attaches a <dialog>-based lightbox to the document.
// The lightbox can be closed by clicking the ✕ button, clicking outside the
// image, or pressing Escape.
function createLightbox() {
    const dialog = document.createElement('dialog');
    dialog.id = 'lightbox';
    dialog.innerHTML = `
        <button id="lightbox-close">✕</button>
        <img id="lightbox-img" src="" alt="Full size image">`;
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog || e.target === dialog.querySelector('img')) {
            dialog.close();
        }
    });
    dialog.querySelector('#lightbox-close').addEventListener('click', () => dialog.close());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dialog.close();
    });
    document.body.appendChild(dialog);
    return dialog;
}

// Opens the lightbox with the given image source, creating the dialog element
// lazily on the first call.
function openLightbox(src) {
    let dialog = document.getElementById('lightbox');
    if (!dialog) dialog = createLightbox();
    dialog.querySelector('#lightbox-img').src = src;
    dialog.showModal();
}

// --- Browser History Navigation ------------------------------------------------

// Handles the browser back/forward buttons.
// Restores either the full timeline (with current search/sort applied)
// or a specific thread view depending on the stored history state.
window.addEventListener('popstate', async (event) => {
    const state = event.state;
    if (!state || state.view === 'timeline') {
        applyFiltersAndSort();
    } else if (state.view === 'thread' && state.tweetId) {
        const fullThread = await fetchFullThread(state.tweetId);
        renderThreadView(fullThread, false, state.tweetId); // false = don't push another history entry
    }
});

// --- Bootstrap ----------------------------------------------------------------

init();