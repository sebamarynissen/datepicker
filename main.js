// # main.js
const form = document.querySelector('form');

document.querySelector('input').focus();

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	const input = form.querySelector('input');
	const value = input.value.toLowerCase();

	let span = document.createElement('span');
	span.textContent = value;
	span.style.setProperty('color', '#ffff00');
	input.replaceWith(span);

	const el = document.createElement('pre');
	document.getElementById('terminal').appendChild(el);
	const date = new Date();
	while (true) {
		const iso = date.toISOString().substring(0, 10);
		const hash = await getHash(iso);
		el.textContent = `Checking hash of ${iso} (${hash})\n`;
		await next();
		if (hash === value) break;
		date.setUTCDate(date.getUTCDate()-1);
	}
	el.textContent += `Thank you, your birth date has been registered as ${date.toISOString().substring(0, 10)}.`;

});

async function getHash(string) {
	const buffer = new TextEncoder().encode(string);
	const arrayBuffer = await crypto.subtle.digest('SHA-256', buffer);
	return [...new Uint8Array(arrayBuffer)].map(b => b.toString(16).padStart(2, '0'))
		.join('')
		.substring(0, 7);
}

function next() {
	return new Promise(cb => requestAnimationFrame(cb));
}
