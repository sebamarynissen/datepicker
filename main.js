// # main.js
const form = document.querySelector('form');

document.querySelector('input').focus();

const candidates = new Set();

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	const input = form.querySelector('input');
	const value = input.value.toLowerCase();

	let span = document.createElement('span');
	span.textContent = value;
	span.style.setProperty('color', '#ffff00');
	input.replaceWith(span);

	let current = new Text();
	const pre = h('pre', current);
	document.getElementById('terminal').appendChild(pre);
	const date = new Date();
	while (true) {
		if (date.getUTCFullYear() < 1900) {
			pre.appendChild(h('span', `// I think all people born before 1900 are dead, right? TODO: Ask ChatGPT\n`, {
				style: 'color: gray;',
			}));
			pre.appendChild(new Text('Invalid date of birth entered'));
			return;
		}
		const iso = date.toISOString().substring(0, 10);
		const hash = await getHash(iso);
		current.textContent = `Checking hash of ${iso} (${hash})\n`;
		await next();
		if (hash === value) {
			candidates.add(iso);
			break;
		};
		date.setUTCDate(date.getUTCDate()-1);
	}

	pre.appendChild(new Text(`It could be that your date of birth is ${date.toISOString().substring(0, 10)}. Checking for clashes...\n`));
	current = new Text();
	pre.appendChild(current);
	date.setUTCDate(date.getUTCDate()-1);
	while (true) {
		if (date.getUTCFullYear() < 1900) break;
		const iso = date.toISOString().substring(0, 10);
		const hash = await getHash(iso);
		current.textContent = `Checking hash of ${iso} (${hash})\n`;
		await next();
		if (hash === value) {
			candidates.add(iso);
			current.textContent = `Clash found with ${iso} (${hash})\n`;
			current = new Text();
			pre.appendChild(current);
		}
		date.setUTCDate(date.getUTCDate()-1);
	}
	pre.appendChild(h('span', `// I think all people born before 1900 are dead, right? TODO: Ask ChatGPT\n`, {
		style: 'color: gray;',
	}));
	if (candidates.size === 1) {
		const [date] = candidates;
		pre.appendChild(new Text(`Thank you, your birth date has been registered as ${date}.`));
		return;
	} else {
		const input = h('input', [], {
			type: 'text',
			style: 'width: 96px',
		});
		const line = h('div', [
			'Please select your date of birth from the list above and type it here: ',
			input,
		]);
		const form = h('form', [
			h('div', `We have found the following possible dates of birth: `+[...candidates].join(' ')),
			line,
		]);
		document.getElementById('terminal').append(form);
		input.focus();
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			line.replaceWith(h('span', [
				`Please select your date of birth from the list above and type if here: `,
				h('span', input.value, {
					style: 'color: #ffff00',
				}),
				'\n',
			]));
			form.appendChild(h('div', `Thank you, your date of birth has been registered as ${input.value}\n`));
		});
	}

});

function h(tag, children, attrs = {}) {
	const el = document.createElement(tag);
	const arr = [children].flat();
	for (let child of arr) {
		if (typeof child === 'string') {
			el.appendChild(new Text(child));
		} else {
			el.appendChild(child);
		}
	}
	for (let key of Object.keys(attrs)) {
		el.setAttribute(key, attrs[key]);
	}
	return el;
}

async function getHash(string) {
	const buffer = new TextEncoder().encode(string);
	const arrayBuffer = await crypto.subtle.digest('SHA-256', buffer);
	return [...new Uint8Array(arrayBuffer)].map(b => b.toString(16).padStart(2, '0'))
		.join('')
		.substring(0, 7);
}

let i = 0;
function next() {
	if (++i % 10 === 0) return new Promise(cb => requestAnimationFrame(cb));
}
