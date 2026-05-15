let tweetMap = new Map();
let currentViewTweets = []; // Store whatever is currently in the timeline
const ASSET_BASE = "https://raw.githubusercontent.com/robbieandrew/twitter_assets/main/";

async function init() {
    const response = await fetch('tweets.json');
    const tweets = await response.json();

    tweets.forEach(item => {
        tweetMap.set(item.tweet.id_str, item.tweet);
    });

    const defaultTweets = tweets.slice(0, 20);
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
    // This stays mostly the same, but we use a loop to ensure we get to the very top
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
            queue.push(reply.id_str); // Add this reply to the queue to find ITS replies
        });
    }

    // Combine them (Removing the duplicate targetTweetId which is in both ancestors and descendants)
    // We use a Map or Set to ensure unique IDs
    const fullConversation = [...ancestors, ...descendants];
    const uniqueMap = new Map();
    fullConversation.forEach(t => uniqueMap.set(t.id_str || 'ext-' + Math.random(), t));
    
    return Array.from(uniqueMap.values());
}

function getAssetUrl(tweetId, originalUrl) {
    // 1. Get the original filename (e.g., "GhZhNxaWoAA-MGf.jpg")
    const originalFilename = originalUrl.split('/').pop();
    
    // 2. Reconstruct the archive's filename format: [TweetID]-[Filename]
    const archiveFilename = `${tweetId}-${originalFilename}`;
    
    // 3. Get the first three characters for the subfolder (e.g., "187")
    const prefix = archiveFilename.substring(0, 3);
    
    // 4. Return the full path to your GitHub repo
    return `${ASSET_BASE}${prefix}/${archiveFilename}`;
}

function renderTimeline(tweetsToRender) {
	currentViewTweets = tweetsToRender; // Save the state!
    const container = document.getElementById('tweet-container');
    container.innerHTML = '';

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

        // ADDED: The header with the avatar image link
        tweetDiv.innerHTML = `
            <div class="tweet-header">
                <img src="img/avatar.jpg" class="avatar" alt="profile">
                <div class="user-info">
                    <strong>Robbie Andrew</strong>
                    <span>@robbie_andrew</span>
                </div>
            </div>
            <div class="content">
                <p>${tweet.full_text}</p>
                ${mediaHtml}
                <div class="date">${tweet.created_at}</div>
            </div>
        `;
        container.appendChild(tweetDiv);
    });
}


let debounceTimer;

document.getElementById('search-bar').addEventListener('input', (e) => {
    // 1. Stop any timer currently running from a previous keystroke
    clearTimeout(debounceTimer);

    const term = e.target.value.toLowerCase();

    // 2. Immediate Reset: If they clear the box, show the default latest tweets
    if (term.length === 0) {
        renderTimeline(Array.from(tweetMap.values()).slice(0, 20));
        return;
    }

    // 3. The "Min 3" Barrier: If it's too short, do nothing and wait
    if (term.length < 3) return;

    // 4. The Debounce: Wait 300ms before doing the "heavy lifting"
    debounceTimer = setTimeout(() => {
        console.log(`Searching for: ${term}...`); // Optional: to see it in action in the console
        
        const filtered = Array.from(tweetMap.values())
            .filter(t => t.full_text.toLowerCase().includes(term));
            
        renderTimeline(filtered);
    }, 300); 
});

init();

document.getElementById('tweet-container').addEventListener('click', async (e) => {
    // Find the closest parent with the class 'tweet'
    const tweetEl = e.target.closest('.tweet');
    
    if (tweetEl && tweetEl.classList.contains('is-clickable')) {
        const tweetId = tweetEl.getAttribute('data-id');
        
        // Show a loading state so you know it's working
        tweetEl.style.opacity = '0.5'; 
        
        const fullThread = await fetchFullThread(tweetId);
        renderThreadView(fullThread);
    }
});

function renderThreadView(threadArray, pushToHistory = true) {
	// If this is a fresh click, push a state to the browser history
    if (pushToHistory) {
        history.pushState({ view: 'thread' }, 'Thread', '');
    }

    const container = document.getElementById('tweet-container');
    container.innerHTML = '<button onclick="history.back()" class="back-btn">← Back</button>';


    const wrapper = document.createElement('div');
    wrapper.className = 'thread-wrapper';

    threadArray.forEach(item => {
        const tweetDiv = document.createElement('div');
        
        if (item.isExternal) {
            // This renders the HTML we got from the X.com OEmbed API
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
					<p>${tweet.full_text}</p>
					${mediaHtml}
					<div class="date">${tweet.created_at}</div>
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
    
    // Trigger X.com's widget script to turn the blockquote into a real tweet
    if (window.twttr) {
        window.twttr.widgets.load();
    }
}

window.addEventListener('popstate', (event) => {
    // If there is no state (meaning we are back at the home/search results)
    if (!event.state || event.state.view !== 'thread') {
        renderTimeline(currentViewTweets);
    }
});
