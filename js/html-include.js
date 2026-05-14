// Replace the innerHTML of any tag with attribute data-include with the specified file
document.addEventListener("DOMContentLoaded", function () {
	document.querySelectorAll("[data-include]").forEach(el => {
		const file = el.getAttribute("data-include");
		fetch(file)
			.then(response => response.text())
			.then(data => el.innerHTML = data)
			.catch(error => console.error(`Error loading ${file}:`, error));
	});
});
