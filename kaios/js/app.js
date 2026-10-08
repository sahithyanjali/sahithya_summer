// Main KaiOS App Logic for Sphoorthi Seva
document.addEventListener('DOMContentLoaded', () => {
  const statsTotal = document.getElementById('stat-total');
  const statsDonors = document.getElementById('stat-donors');
  const eventsContainer = document.getElementById('events-container');

  // Fetch live stats from backend
  async function fetchLiveStats() {
    try {
      const res = await fetch('/api/v1/donations');
      if (res.ok) {
        const data = await res.json();
        if (data.totalSum && statsTotal) {
          statsTotal.textContent = '₹' + Math.round(data.totalSum).toLocaleString('en-IN');
        }
        if (data.count && statsDonors) {
          statsDonors.textContent = data.count + ' Donors';
        }
      }
    } catch (e) {
      console.log('KaiOS using cached donation state');
    }
  }

  // Fetch live events
  async function fetchLiveEvents() {
    try {
      const res = await fetch('/api/v1/events');
      if (res.ok) {
        const data = await res.json();
        if (data.events && eventsContainer) {
          eventsContainer.innerHTML = '';
          data.events.slice(0, 3).forEach((ev) => {
            const item = document.createElement('div');
            item.className = 'focusable';
            item.tabIndex = 0;
            item.innerHTML = `
              <div style="display:flex;justify-content:space-between;font-weight:bold;color:#f97316;font-size:10px;">
                <span>${ev.date}</span>
                <span style="color:#94a3b8;">${ev.category || 'Relief'}</span>
              </div>
              <div style="font-weight:bold;margin-top:2px;">${ev.title}</div>
              <div class="subtext">${ev.location}</div>
            `;
            item.onclick = () => {
              alert('Event: ' + ev.title + '\nLocation: ' + ev.location);
            };
            eventsContainer.appendChild(item);
          });
          window.dpad.updateFocusables();
        }
      }
    } catch (e) {
      console.log('KaiOS using cached events');
    }
  }

  // Softkey actions
  window.addEventListener('kaios-soft-left', () => {
    // Quick Donate ₹500 via KaiOS UPI/SMS
    alert('Sphoorthi Seva Trust\nDial *99# or use BHIM UPI to donate to: donate@sphoorthitrust\n80G Tax Exemption active.');
  });

  window.addEventListener('kaios-soft-right', () => {
    // Refresh
    fetchLiveStats();
    fetchLiveEvents();
    alert('Data synced with live backend.');
  });

  fetchLiveStats();
  fetchLiveEvents();
  window.dpad.updateFocusables();
});
