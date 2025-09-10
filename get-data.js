/** ---------------------Get data------------------------------ */

let subParams = [atob('J3N1YicsICdiYXNlNjQnLCAnYjY0JywgJ2NsYXNoJywgJ3Npbmdib3gnLCAnc2In')];
let blsz = decodeURIComponent(escape(atob('5oKo55qE6K6i6ZiF6IqC54K555Sx6K6+572u5Y+Y6YeP')));
let blsz1 = decodeURIComponent(escape(atob('5o+Q5L6bLCDlvZPliY3kvb/nlKjlj43ku6PmmK8=')));
let blsz2 = decodeURIComponent(escape(atob('5o+Q5L6bLCDlvZPliY3msqHorr7nva7lj43ku6MsIOaOqOiNkOaCqOiuvue9rlBST1hZSVDlj5jph4/miJZTT0NLUzXlj5jph4/miJborqLpmIXov57mjqXluKZwcm94eUlQ')));

/**
 * @param {string} userID
 * @param {string | null} host
 * @param {string} userAgent
 * @param {string} _url
 * @returns {Promise<string>}
 */
async function getchannelConfig(userID, host, userAgent, _url, protType, ipv6to4, hostRemark) {
	// console.log(`------------getchannelConfig------------------`);
	// console.log(`userID: ${userID} \n host: ${host} \n userAgent: ${userAgent} \n _url: ${_url}`);

	userAgent = userAgent.toLowerCase();
	let port = 443;
	if (host.includes('.workers.dev')) {
		port = 80;
	}

	if (userAgent.includes('mozilla') && !subParams.some(param => _url.searchParams.has(param))) {
		if (!protType) {
			protType = atob(atob(protTypeBase64));
		}

		const [v2, c] = getConfigLink(userID, host, host, port, host, proxyIP, protType, ipv6to4);
		return getHtmlResponse(socks5Enable, userID, host, v2, c);
	}

	// Get node information
	let num = randomNum || 25;
	if (protType && !randomNum) {
		num = num * 2;
	}
	fakeHostName = getFakeHostName(host);
	const ipUrlTxtAndCsv = await getIpUrlTxtAndCsv(noTLS, ipUrlTxt, ipUrlCsv, num);

	// console.log(`txt: ${ipUrlTxtAndCsv.txt} \n csv: ${ipUrlTxtAndCsv.csv}`);
	let content = await getSubscribeNode(userAgent, _url, host, fakeHostName, fakeUserID, noTLS, ipUrlTxtAndCsv.txt, ipUrlTxtAndCsv.csv, protType, ipv6to4, hostRemark);

	return _url.pathname === `/${fakeUserID}` ? content : revertFakeInfo(content, userID, host);

}

function getHtmlResponse(socks5Enable, userID, host, v2, c) {
	const subRemark = `IP_LOCAL/IP_URL/IP_URL_TXT/IP_URL_CSV`;
	let proxyIPRemark = `PROXYIP: ${proxyIP}`;

	if (socks5Enable) {
		proxyIPRemark = `socks5: ${parsedSocks5.hostname}:${parsedSocks5.port}`;
	}

	let remark = `${blsz} ${subRemark} ${blsz2} ${proxyIPRemark}`;

	if (!proxyIP && !socks5Enable) {
		remark = `${blsz} ${subRemark} ${blsz3}`;
	}

	return getConfigHtml(userID, host, remark, v2, c);
}


function getFakeHostName(host) {
	if (host.includes(".pages.dev")) {
		return `${fakeHostName}.pages.dev`;
	} else if (host.includes(".workers.dev") || host.includes("notls") || noTLS === 'true') {
		return `${fakeHostName}.workers.dev`;
	}
	return `${fakeHostName}.xyz`;
}

async function getIpUrlTxtAndCsv(noTLS, urlTxts, urlCsvs, num) {
	if (noTLS === 'true') {
		return {
			txt: await getIpUrlTxt(urlTxts, num),
			csv: await getIpUrlCsv(urlCsvs, 'FALSE')
		};
	}
	return {
		txt: await getIpUrlTxt(urlTxts, num),
		csv: await getIpUrlCsv(urlCsvs, 'TRUE')
	};
}

async function getIpUrlTxt(urlTxts, num) {
	if (!urlTxts || urlTxts.length === 0) {
		return [];
	}

	let ipTxt = "";
	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, 2000);

	try {
		const urlMappings = urlTxts.map(entry => {
			const [url, suffix] = entry.split('@');
			return { url, suffix: suffix ? `@${suffix}` : '' };
		});

		const responses = await Promise.allSettled(
			urlMappings.map(({ url }) =>
				fetch(url, {
					method: 'GET',
					headers: {
						'Accept': 'text/html,application/xhtml+xml,application/xml;',
						'User-Agent': projectName
					},
					signal: controller.signal
				}).then(response => response.ok ? response.text() : Promise.reject())
			)
		);

		for (let i = 0; i < responses.length; i++) {
			const response = responses[i];
			if (response.status === 'fulfilled') {
				const suffix = urlMappings[i].suffix;
				const content = response.value
					.split('\n')
					.filter(line => line.trim() !== "")
					.map(line => line + suffix)
					.join('\n');

				ipTxt += content + '\n';
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		clearTimeout(timeout);
	}
	// console.log(`getIpUrlTxt-->ipTxt: ${ipTxt} \n `);
	let newIpTxt = await addIpText(ipTxt);

	// Randomly select 50 items
	const hasAcCom = urlTxts.includes(defaultIpUrlTxt);
	if (hasAcCom || randomNum) {
		newIpTxt = getRandomItems(newIpTxt, num);
	}

	return newIpTxt;
}

async function getIpUrlTxtToArry(urlTxts) {
	if (!urlTxts || urlTxts.length === 0) {
		return [];
	}

	let ipTxt = "";

	// Create an AbortController object to control the cancellation of fetch requests
	const controller = new AbortController();

	// Set a timeout to trigger the cancellation of all requests after 2 seconds
	const timeout = setTimeout(() => {
		controller.abort(); // Cancel all requests
	}, 2000);

	try {
		// Use Promise.allSettled to wait for all API requests to complete, regardless of success or failure
		// Iterate over the api array and send a fetch request to each API URL
		const responses = await Promise.allSettled(urlTxts.map(apiUrl => fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'User-Agent': projectName
			},
			signal: controller.signal // Attach the AbortController's signal to the fetch request to allow cancellation when needed
		}).then(response => response.ok ? response.text() : Promise.reject())));

		// Iterate through all the responses
		for (const response of responses) {
			// Check if the request was fulfilled successfully
			if (response.status === 'fulfilled') {
				// Get the response content
				const content = await response.value;
				ipTxt += content + '\n';
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		// Clear the timeout regardless of success or failure
		clearTimeout(timeout);
	}

	// Process the result using addIpText function
	const newIpTxt = await addIpText(ipTxt);
	// console.log(`ipUrlTxts: ${ipUrlTxts} \n ipTxt: ${ipTxt} \n newIpTxt: ${newIpTxt} `);

	// Return the processed result
	return newIpTxt;
}

async function getIpUrlCsv(urlCsvs, tls) {
	// Check if the CSV URLs are valid
	if (!urlCsvs || urlCsvs.length === 0) {
		return [];
	}

	const newAddressesCsv = [];

	// Fetch and process all CSVs concurrently
	const fetchCsvPromises = urlCsvs.map(async (csvUrl) => {
		// Parse the URL to get the suffix (after @)
		const [url, suffix] = csvUrl.split('@');
		const suffixText = suffix ? `@${suffix}` : '';  // If no @, suffixText will be an empty string

		try {
			const response = await fetch(url);


			// Ensure the response is successful
			if (!response.ok) {
				console.error('Error fetching CSV:', response.status, response.statusText);
				return;
			}

			// Parse the CSV content and split it into lines
			const text = await response.text();
			const lines = text.includes('\r\n') ? text.split('\r\n') : text.split('\n');

			// Ensure we have a non-empty CSV
			if (lines.length < 2) {
				console.error('CSV file is empty or has no data rows');
				return;
			}

			// Extract the header and get required field indexes
			const header = lines[0].trim().split(',');
			const tlsIndex = header.indexOf('TLS');
			const ipAddressIndex = 0; // Assuming the first column is IP address
			const portIndex = 1; // Assuming the second column is port
			const dataCenterIndex = tlsIndex + 1; // Data center assumed to be right after TLS
			const speedIndex = header.length - 1; // Last column for speed

			// If the required fields are missing, skip this CSV
			if (tlsIndex === -1) {
				console.error('CSV file missing required TLS field');
				return;
			}

			// Process the data rows
			for (let i = 1; i < lines.length; i++) {
				const columns = lines[i].trim().split(',');
				// Skip empty or malformed rows
				if (columns.length < header.length) {
					continue;
				}
				// Check if TLS matches and speed is greater than sl
				const tlsValue = columns[tlsIndex].toUpperCase();
				const speedValue = parseFloat(columns[speedIndex]);
				if (tlsValue === tls && speedValue > sl) {
					const ipAddress = columns[ipAddressIndex];
					const port = columns[portIndex];
					const dataCenter = columns[dataCenterIndex];
					// Add suffix to the result
					newAddressesCsv.push(`${ipAddress}:${port}#${dataCenter}${suffixText}`);
				}
			}
		} catch (error) {
			console.error('Error processing CSV URL:', csvUrl, error);
		}
	});

	// Wait for all CSVs to be processed
	await Promise.all(fetchCsvPromises);

	// console.log(`newAddressesCsv: ${newAddressesCsv} \n `);
	return newAddressesCsv;
}

/**
 * Get node configuration information
 * @param {*} id 
 * @param {*} host 
 * @param {*} address 
 * @param {*} port 
 * @param {*} remarks 
 * @returns 
 */
function getConfigLink(id, host, address, port, remarks, proxyip, protType, ipv6to4) {
	const encryption = 'none';
	let pathParm = `&PROT_TYPE=${protType}`;
	if (proxyip) {
		pathParm = pathParm + `&PROXYIP=${proxyip}`;
	}
	if (ipv6to4) {
		pathParm = pathParm + `&NAT64=${ipv6to4}`;
	}
	let path = `/?ed=2560` + pathParm;
	const fingerprint = 'randomized';
	let tls = ['tls', true];
	if (host.includes('.workers.dev') || host.includes('pages.dev')) {
		path = `/${host}${path}`;
		remarks += ' 请通过绑定自定义域名订阅！';
	}

	const v2 = getV2Link({ protType, host, id, address, port, remarks, encryption, path, fingerprint, tls });
	const c = getChLink(protType, host, address, port, id, path, tls, fingerprint);

	return [v2, c];
}

let v2a = decodeURIComponent(escape(atob('Oi8v')));
let v2b = decodeURIComponent(escape(atob('QA==')));
let v2c = decodeURIComponent(escape(atob('Og==')));
let v2d = decodeURIComponent(escape(atob('P2VuY3J5cHRpb249')));
let v2e = decodeURIComponent(escape(atob('JnNlY3VyaXR5PQ==')));
let v2f = decodeURIComponent(escape(atob('JnR5cGU9')));
let v2g = decodeURIComponent(escape(atob('Jmhvc3Q9')));
let v2h = decodeURIComponent(escape(atob('JnBhdGg9')));
let v2i = decodeURIComponent(escape(atob('')));

/**
 * Get channel information
 * @param {*} param0 
 * @returns 
 */
function getV2Link({ protType, host, id, address, port, remarks, encryption, path, fingerprint, tls }) {
	let sniAndFp = `&sni=${host}&fp=${fingerprint}`;
	if (portSet_http.has(parseInt(port))) {
		tls = ['', false];
		sniAndFp = '';
	}

	return `${protType}${v2a}${id}${v2b}${address}${v2c}${port}${v2d}${encryption}${v2e}${tls[0]}${v2f}${network}${v2g}${host}${v2h}${encodeURIComponent(path)}${sniAndFp}#${encodeURIComponent(remarks)}`;
}

/**
 * Get channel information
 * @param {*} protType 
 * @param {*} host 
 * @param {*} address 
 * @param {*} port 
 * @param {*} id 
 * @param {*} path 
 * @param {*} tls 
 * @param {*} fingerprint 
 * @returns 
 */
function getChLink(protType, host, address, port, id, path, tls, fingerprint) {
	return `- {type: ${protType}, name: ${host}, server: ${address}, port: ${port}, password: ${id}, network: ${network}, tls: ${tls[1]}, udp: false, sni: ${host}, client-fingerprint: ${fingerprint}, skip-cert-verify: true,  ws-opts: {path: ${path}, headers: {Host: ${host}}}}`;
}


let v2y = atob('djJyYXk=');
let clh = atob('Y2xhc2g=');
let six = atob('c2luZy1ib3g=');
let cla = atob('Y2xhc2gtbWV0YQ==');
let dydz_remark = decodeURIComponent(escape(
	atob('6K6i6ZiF5Zyw5Z2ALCDmlK/mjIEgQmFzZTY044CBY2xhc2gtbWV0YeOAgXNpbmctYm9444CBUXVhbnR1bXVsdCBY44CB5bCP54Gr566t44CBc3VyZ2Ug562J6K6i6ZiF5qC85byP')
));
let djfzdydz = decodeURIComponent(escape(atob('54K55Ye75aSN5Yi26K6i6ZiF5Zyw5Z2A')));
let dydz = decodeURIComponent(escape(atob('6K6i6ZiF5Zyw5Z2A')));
let tgjlq = atob('aHR0cHM6Ly90Lm1lL2FtX2NsdWJz');
let gh = atob('aHR0cHM6Ly9naXRodWIuY29tL2FtY2x1YnM=');
let yt_remark = decodeURIComponent(escape(atob('eW91dHViZSjmlbDlrZflpZfliKkpIGh0dHBzOi8veW91dHViZS5jb20vQGFtX2NsdWJz')));


/**
 * Generate home page
 * @param {*} userID 
 * @param {*} hostName 
 * @param {*} remark 
 * @param {*} v2
 * @param {*} ch 
 * @returns 
 */
function getConfigHtml(userID, host, remark, v2, ch) {
	// HTML Head with CSS and FontAwesome library
	const htmlHead = `
    <head>
      <title>${projectName}(${fileName})</title>
      <meta name='description' content='This is a project to generate free vmess nodes. For more information, please subscribe ${yt_remark}s and follow GitHub ${gh} ' />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
          color: #333;
          padding: 0;
          margin: 0;
        }
        a {
          color: #1a0dab;
          text-decoration: none;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          background-color: #fff;
          border: 1px solid #ddd;
          padding: 10px;
          margin: 0;
        }
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #333;
            color: #f0f0f0;
          }
          a {
            color: #9db4ff;
          }
          pre {
            background-color: #282a36;
            border-color: #6272a4;
          }
        }
      </style>
    </head>
  `;

	// Prepare header string with left alignment
	const header = `
		<p align="left" style="padding-left: 20px; margin-top: 20px;">
		Telegram交流群 点击加入，技术大佬~在线交流</br>
		<a href="${tgjlq}" target="_blank">${tgjlq}</a>
		</br></br>
		YouTube频道 点击订阅频道，观看更多技术教程</br>
		<a href="${ytName}?sub_confirmation=1" target="_blank">${ytName}</a>
		</br></br>
		GitHub项目地址 点击进入，点下星星给个Star!Star!Star!</br>
		<a href="https://github.com/${projectName}" target="_blank">https://github.com/${projectName}</a>
		</p>
  `;

	// Prepare the output string
	const httpAddr = `https://${host}/${userID}`;
	const output = `
################################################################
${dydz_remark}, ${remark}
---------------------------------------------------------------
通用${dydz}: <button onclick='copyToClipboard("${httpAddr}?sub")'><i class="fa fa-clipboard"></i> ${djfzdydz} </button>
${httpAddr}?sub

Base64${dydz}: <button onclick='copyToClipboard("${httpAddr}?base64")'><i class="fa fa-clipboard"></i> ${djfzdydz} </button>
${httpAddr}?base64

${clh}${dydz}: <button onclick='copyToClipboard("${httpAddr}?${clh}")'><i class="fa fa-clipboard"></i> ${djfzdydz} </button>
${httpAddr}?${clh}

${six}${dydz}: <button onclick='copyToClipboard("${httpAddr}?${six}")'><i class="fa fa-clipboard"></i> ${djfzdydz} </button>
${httpAddr}?${six}
---------------------------------------------------------------
################################################################
${v2y}
---------------------------------------------------------------
${v2}
---------------------------------------------------------------
################################################################
${cla}
---------------------------------------------------------------
${ch}
---------------------------------------------------------------
################################################################
  `;

	// Final HTML
	const html = `
<html>
${htmlHead}
<body>
  ${header}
  <pre>${output}</pre>
  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert("Copied to clipboard");
        })
        .catch(err => {
          console.error("Failed to copy to clipboard:", err);
        });
    }
  </script>
</body>
</html>
  `;

	return html;
}



let portSet_http = new Set([80, 8080, 8880, 2052, 2086, 2095, 2082]);
let portSet_https = new Set([443, 8443, 2053, 2096, 2087, 2083]);
/**
 * 
 * @param {*} host 
 * @param {*} noTLS 
 * @param {*} ipUrlTxt 
 * @param {*} ipUrlCsv 
 * @returns 
 */
async function getSubscribeNode(userAgent, _url, host, fakeHostName, fakeUserID, noTLS, ipUrlTxt, ipUrlCsv, protType, ipv6to4, hostRemark) {
	// Use Set object to remove duplicates
	const uniqueIpTxt = [...new Set([...ipUrlTxt, ...ipUrlCsv])];
	let responseBody;
	if (!protType) {
		protType = atob(atob(protTypeBase64));
		const responseBody1 = splitNodeData(uniqueIpTxt, noTLS, fakeHostName, fakeUserID, userAgent, protType, ipv6to4, hostRemark);
		protType = atob(atob(protTypeBase64Tro));
		const responseBody2 = splitNodeData(uniqueIpTxt, noTLS, fakeHostName, fakeUserID, userAgent, protType, ipv6to4, hostRemark);
		responseBody = [responseBody1, responseBody2].join('\n');
	} else {
		responseBody = splitNodeData(uniqueIpTxt, noTLS, fakeHostName, fakeUserID, userAgent, atob(atob(protTypeBase64)), ipv6to4, hostRemark);
		responseBody = [responseBody].join('\n');
	}
	protType = atob(atob(protTypeBase64));
	const responseBodyTop = splitNodeData(ipLocal, noTLS, fakeHostName, fakeUserID, userAgent, protType, ipv6to4, hostRemark);
	responseBody = [responseBodyTop, responseBody].join('\n');
	responseBody = btoa(responseBody);
	// console.log(`getSubscribeNode---> responseBody: ${responseBody} `);

	if (!userAgent.includes(('CF-FAKE-UA').toLowerCase())) {

		let url = `https://${host}/${fakeUserID}`;

		if (isChCondition(userAgent, _url)) {
			isBase64 = false;
			url = createSubConverterUrl(atob('Y2xhc2g='), url, subConfig, subConverter, subProtocol);
		} else if (isSbCondition(userAgent, _url)) {
			isBase64 = false;
			url = createSubConverterUrl(atob('c2luZ2JveA=='), url, subConfig, subConverter, subProtocol);
		} else {
			return responseBody;
		}
		const response = await fetch(url, {
			headers: {
				//'Content-Type': 'text/html; charset=UTF-8',
				'User-Agent': `${userAgent} ${projectName}`
			}
		});
		responseBody = await response.text();
		//console.log(`getSubscribeNode---> url: ${url} `);
	}

	return responseBody;
}

function createSubConverterUrl(target, url, subConfig, subConverter, subProtocol) {
	return `${subProtocol}://${subConverter}/sub?target=${target}&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
}

function isChCondition(userAgent, _url) {
	return (userAgent.includes(atob('Y2xhc2g=')) && !userAgent.includes(atob('bmVrb2JveA=='))) || (_url.searchParams.has(atob('Y2xhc2g=')) && !userAgent.includes('subConverter'));
}

function isSbCondition(userAgent, _url) {
	return userAgent.includes(atob('c2luZ2JveA==')) || userAgent.includes(atob('c2luZ2JveA==')) || ((_url.searchParams.has(atob('c2luZ2JveA==')) || _url.searchParams.has('sb')) && !userAgent.includes('subConverter'));
}

/**
 * 
 * @param {*} uniqueIpTxt 
 * @param {*} noTLS 
 * @param {*} host 
 * @param {*} id 
 * @returns 
 */
function splitNodeData(uniqueIpTxt, noTLS, host, id, userAgent, protType, ipv6to4, hostRemark) {
	const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[.*\]):?(\d+)?#?([^@#]*)@?(.*)?$/;

	const responseBody = uniqueIpTxt.map(ipTxt => {
		// console.log(`splitNodeData---> ipTxt: ${ipTxt} `);
		let address = ipTxt;
		let port = "443";
		let remarks = "";
		let proxyip = "";

		const match = address.match(regex);
		if (match && !ipTxt.includes(atob('QGFtX2NsdWJz'))) {
			address = match[1];
			port = match[2] || port;
			remarks = hostRemark ? host : (match[3] || address || host);
			proxyip = match[4] || '';
			// console.log(`splitNodeData--match-> \n address: ${address} \n port: ${port} \n remarks: ${remarks} \n proxyip: ${proxyip}`);
		} else {
			let ip, newPort, extra;

			if (ipTxt.includes('@') && !ipTxt.includes(atob('QGFtX2NsdWJz'))) {
				const [addressPart, proxyipPart] = ipTxt.split('@');
				ipTxt = addressPart;
				proxyip = proxyipPart;
				// console.log(`splitNodeData-ipTxt.includes('@')--> ipTxt: ${ipTxt} \n proxyip: ${proxyip} `);
			}
			if (ipTxt.includes(':') && ipTxt.includes('#')) {
				[ip, newPort, extra] = ipTxt.split(/[:#]/);
			} else if (ipTxt.includes(':')) {
				[ip, newPort] = ipTxt.split(':');
			} else if (ipTxt.includes('#')) {
				[ip, extra] = ipTxt.split('#');
			} else {
				ip = ipTxt;
			}

			address = ip;
			port = newPort || port;
			remarks = hostRemark ? host : (extra || address || host);
			// console.log(`splitNodeData---> \n address: ${address} \n port: ${port} \n remarks: ${remarks} \n proxyip: ${proxyip}`);
		}

		// Check if TLS is disabled and if the port is in the allowed set
		if (noTLS !== 'true' && portSet_http.has(parseInt(port))) {
			return null;
		}

		const [v2, c] = getConfigLink(id, host, address, port, remarks, proxyip, protType, ipv6to4);
		return v2;
	}).filter(Boolean).join('\n');

	// return btoa(responseBody);
	return responseBody;
}
