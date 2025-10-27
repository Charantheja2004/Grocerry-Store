// ======= UI Toggles =======
      const searchForm = document.querySelector('.search-form');
      const shoppingCart = document.querySelector('.shopping-cart');
      const loginForm = document.querySelector('.login-form');
      const navbar = document.querySelector('.navbar');

      document.querySelector('#search-btn').onclick = () => {
        searchForm.classList.toggle('active');
        navbar.classList.remove('active');
        loginForm.classList.remove('active');
        shoppingCart.classList.remove('active');
        // focus input when opening search
        if (searchForm.classList.contains('active')) {
          setTimeout(() => document.querySelector('#search-box').focus(), 120);
        }
      };
      document.querySelector('#cart-btn').onclick = () => {
        shoppingCart.classList.toggle('active');
        searchForm.classList.remove('active');
        navbar.classList.remove('active');
        loginForm.classList.remove('active');
      };
      document.querySelector('#user-btn').onclick = () => {
        loginForm.classList.toggle('active');
        searchForm.classList.remove('active');
        navbar.classList.remove('active');
        shoppingCart.classList.remove('active');
      };
      document.querySelector('#menu-btn').onclick = () => {
        navbar.classList.toggle('active');
        searchForm.classList.remove('active');
        loginForm.classList.remove('active');
        shoppingCart.classList.remove('active');
      };
      window.onscroll = () => {
        searchForm.classList.remove('active');
        navbar.classList.remove('active');
        loginForm.classList.remove('active');
        shoppingCart.classList.remove('active');
      };

      // ======= Swipers =======
      const productSwiper1 = new Swiper('.products .product-slider:nth-of-type(1)', {
        loop: true,
        spaceBetween: 20,
        autoplay: { delay: 7500, disableOnInteraction: false },
        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } },
      });
      const productSwiper2 = new Swiper('.products .product-slider:nth-of-type(2)', {
        loop: true,
        spaceBetween: 20,
        autoplay: { delay: 7500, disableOnInteraction: false },
        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } },
      });
      const reviewSwiper = new Swiper('.review-slider', {
        loop: true,
        spaceBetween: 20,
        autoplay: { delay: 7500, disableOnInteraction: false },
        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1020: { slidesPerView: 3 } },
      });

      // ======= Dynamic Cart Logic =======
      const cartItemsContainer = document.querySelector('.shopping-cart .cart-items');
      const totalEl = document.querySelector('.shopping-cart .total');

      function parsePrice(text) {
        const match = text.replace(/,/g, '').match(/[0-9]+(\.[0-9]+)?/);
        return match ? parseFloat(match[0]) : 0;
      }
      function formatPrice(num) {
        return `$${num.toFixed(2)}`;
      }
      function updateTotal() {
        let sum = 0;
        cartItemsContainer.querySelectorAll('.box .price').forEach((p) => {
          sum += parsePrice(p.textContent);
        });
        totalEl.textContent = `total: ${formatPrice(sum)}`;
      }

      function addToCartFromProductBox(productBox) {
        const imgSrc = productBox.querySelector('img')?.getAttribute('src') || '';
        const name = productBox.querySelector('h1')?.textContent?.trim() || 'Item';
        const priceText = productBox.querySelector('.price')?.textContent?.trim() || '$0.00';
        const starsHTML = productBox.querySelector('.stars')?.innerHTML || '';

        const box = document.createElement('div');
        box.className = 'box';
        box.innerHTML = `
          <i class="fa fa-trash" aria-hidden="true"></i>
          <img src="${imgSrc}" alt="${name}">
          <div class="content">
            <h3>${name}</h3>
            <span class="price">${priceText}</span>
            <div class="stars">${starsHTML}</div>
          </div>
        `;
        cartItemsContainer.appendChild(box);
        updateTotal();
      }

      // Attach to all Add-to-cart buttons (both sliders)
      document.querySelectorAll('.products .product-slider .box .btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const productBox = btn.closest('.box');
          addToCartFromProductBox(productBox);
          // Open cart so the user sees it added
          shoppingCart.classList.add('active');
        });
      });

      // Remove item (event delegation on cart)
      cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('fa-trash')) {
          const box = e.target.closest('.box');
          if (box) box.remove();
          updateTotal();
        }
      });

      // ======= Search / Scroll-to-product functionality =======
      // Inject small CSS used for highlighting and 'not found' feedback
      (function injectSearchStyles() {
        const css = `
          .products .product-slider .box.highlight{box-shadow:0 0 0 6px rgba(255,165,0,0.25); transform: translateY(-6px); transition: all .25s ease;}
          #search-box.not-found{outline: 2px solid #e74c3c; animation: searchShake .45s}
          @keyframes searchShake{0%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-4px)}100%{transform:translateX(0)}}
        `;
        const s = document.createElement('style');
        s.textContent = css;
        document.head.appendChild(s);
      })();

      const searchInput = document.querySelector('#search-box');
      // We'll use a snapshot of product boxes (original DOM nodes). Swiper clones may exist but scrollIntoView will still work.
      function getAllProductBoxes() {
        return Array.from(document.querySelectorAll('.products .product-slider .box'));
      }

      function clearHighlights() {
        getAllProductBoxes().forEach((b) => b.classList.remove('highlight'));
      }

      function performSearch(query) {
        const q = (query || '').trim().toLowerCase();
        if (!q) {
          // empty search: quick feedback
          searchInput.classList.add('not-found');
          setTimeout(() => searchInput.classList.remove('not-found'), 450);
          return;
        }

        const boxes = getAllProductBoxes();
        let found = null;

        for (const box of boxes) {
          const title = (box.querySelector('h1')?.textContent || '').toLowerCase();
          const imgAlt = (box.querySelector('img')?.getAttribute('alt') || '').toLowerCase();
          const price = (box.querySelector('.price')?.textContent || '').toLowerCase();

          if (title.includes(q) || imgAlt.includes(q) || price.includes(q)) {
            found = box;
            break;
          }
        }

        clearHighlights();

        if (found) {
          // Scroll the product into view and highlight it briefly
          found.scrollIntoView({ behavior: 'smooth', block: 'center' });
          found.classList.add('highlight');
          // If the products section is below the fixed header, adjust final scroll to account for header
          setTimeout(() => {
            // extra offset to better center beneath fixed header (only if header exists)
            const header = document.querySelector('.header');
            if (header) {
              const headerHeight = header.getBoundingClientRect().height;
              const boxRect = found.getBoundingClientRect();
              const absoluteTop = window.pageYOffset + boxRect.top - headerHeight - 20; // 20px extra
              window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
            }
          }, 450);

          // Remove highlight after a short delay
          setTimeout(() => found.classList.remove('highlight'), 2200);
        } else {
          // no results: shake input briefly
          searchInput.classList.add('not-found');
          setTimeout(() => searchInput.classList.remove('not-found'), 600);
        }
      }

      // Trigger search when user presses Enter inside search box
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch(searchInput.value);
        }
      });

      // Also support form submit if user hits Enter (or you later add a submit button)
      document.querySelector('.search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch(searchInput.value);
      });