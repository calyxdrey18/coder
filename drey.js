    document.addEventListener('DOMContentLoaded', () => {
      const queryInput = document.getElementById('queryInput');
      const submitBtn = document.getElementById('submitBtn');
      const responseContainer = document.getElementById('responseContainer');

      function showLoading() {
        responseContainer.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
      }

      function escapeHtml(text) {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;");
      }

      function formatCodeResponse(response) {
        if (response.includes('```')) {
          const parts = response.split('```');
          let formatted = '';
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
              formatted += `<p>${parts[i]}</p>`;
            } else {
              const code = parts[i].replace(/^[\w-]+\n/, '');
              formatted += `
                <div class="code-container">
                  <div class="code-header">
                    <span>Code</span>
                    <button class="copy-btn" data-code="${escapeHtml(code)}"><i class="fas fa-copy"></i> Copy</button>
                  </div>
                  <div class="code-content">${escapeHtml(code)}</div>
                </div>`;
            }
          }
          return formatted;
        }
        return `<p>${response}</p>`;
      }

      async function getGPTResponse(query) {
        const encodedQuery = encodeURIComponent(query);
        const corsProxy = 'https://corsproxy.io/?';
        const targetURL = `https://api.dreaded.site/api/chatgpt?text=${encodedQuery}`;
        const fullURL = corsProxy + targetURL;

        const res = await fetch(fullURL);
        const data = await res.json();
        if (data?.success && data?.result?.prompt) {
          return data.result.prompt;
        } else {
          throw new Error("API returned invalid response");
        }
      }

      submitBtn.addEventListener('click', async () => {
        const query = queryInput.value.trim();
        if (!query) return;

        showLoading();

        try {
          const result = await getGPTResponse(query);
          responseContainer.innerHTML = formatCodeResponse(result);

          document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const code = btn.getAttribute('data-code');
              navigator.clipboard.writeText(code).then(() => {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { btn.innerHTML = original; }, 2000);
              });
            });
          });
        } catch (err) {
          responseContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${err.message}</div>`;
        }
      });
    });
