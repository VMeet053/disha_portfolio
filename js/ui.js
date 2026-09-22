document.addEventListener('DOMContentLoaded', function () {
    const reviewSlider = document.querySelector('.review-slider');
    if (reviewSlider) {
        const track = reviewSlider.querySelector('.review-track');
        const reviews = Array.from(track.querySelectorAll('.review-card'));
        const count = reviews.length;
        const counter = reviewSlider.querySelector('.review-count');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let current = 0;
        let position = 1;
        let transitioning = false;
        let autoplay;

        if (count > 1) {
            const firstCopy = reviews[0].cloneNode(true);
            const lastCopy = reviews[count - 1].cloneNode(true);
            firstCopy.setAttribute('aria-hidden', 'true');
            lastCopy.setAttribute('aria-hidden', 'true');
            track.prepend(lastCopy);
            track.append(firstCopy);
            track.style.transition = 'none';
            track.style.transform = 'translateX(-100%)';
            track.getBoundingClientRect();
            if (!reducedMotion) track.style.transition = '';

            function updateReview() {
                track.style.transform = 'translateX(-' + position * 100 + '%)';
                counter.textContent = (current + 1) + ' / ' + count;
                reviews.forEach(function (review, index) {
                    review.setAttribute('aria-hidden', index === current ? 'false' : 'true');
                });
            }

            function moveReview(direction) {
                if (transitioning) return;
                current = (current + direction + count) % count;
                position = reducedMotion ? current + 1 : position + direction;
                transitioning = !reducedMotion;
                updateReview();
            }

            track.addEventListener('transitionend', function (event) {
                if (event.target !== track || event.propertyName !== 'transform') return;
                if (position === 0 || position === count + 1) {
                    position = current + 1;
                    track.style.transition = 'none';
                    updateReview();
                    track.getBoundingClientRect();
                    track.style.transition = '';
                }
                transitioning = false;
            });

            reviewSlider.querySelector('.review-previous').addEventListener('click', function () { moveReview(-1); });
            reviewSlider.querySelector('.review-next').addEventListener('click', function () { moveReview(1); });
            reviewSlider.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    moveReview(event.key === 'ArrowRight' ? 1 : -1);
                }
            });

            let touchStart = 0;
            reviewSlider.addEventListener('touchstart', function (event) {
                touchStart = event.changedTouches[0].clientX;
            }, { passive: true });
            reviewSlider.addEventListener('touchend', function (event) {
                const distance = event.changedTouches[0].clientX - touchStart;
                if (Math.abs(distance) > 50) moveReview(distance < 0 ? 1 : -1);
            }, { passive: true });

            function stopAutoplay() { window.clearInterval(autoplay); }
            function startAutoplay() {
                if (reducedMotion || document.hidden) return;
                stopAutoplay();
                autoplay = window.setInterval(function () { moveReview(1); }, 6000);
            }
            reviewSlider.addEventListener('mouseenter', stopAutoplay);
            reviewSlider.addEventListener('mouseleave', startAutoplay);
            reviewSlider.addEventListener('focusin', stopAutoplay);
            reviewSlider.addEventListener('focusout', function (event) {
                if (!reviewSlider.contains(event.relatedTarget)) startAutoplay();
            });
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) stopAutoplay();
                else startAutoplay();
            });
            updateReview();
            startAutoplay();
        }
    }

    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!contactForm.reportValidity()) return;
            const fields = new FormData(contactForm);
            const subject = encodeURIComponent(fields.get('subject'));
            const body = encodeURIComponent(
                'Name: ' + fields.get('name') + '\n' +
                'Email: ' + fields.get('email') + '\n\n' +
                fields.get('message')
            );
            window.location.href = 'mailto:v.meet0503@gmail.com?subject=' + subject + '&body=' + body;
        });
    }

    const projectCards = Array.from(document.querySelectorAll('#project .project-card'));
    const projectPagination = document.querySelector('.project-pagination');
    if (projectPagination && projectCards.length) {
        const pageSize = 6;
        const pageCount = Math.ceil(projectCards.length / pageSize);
        const pageButtons = [];

        function showProjectPage(page) {
            projectCards.forEach(function (card, index) {
                card.hidden = Math.floor(index / pageSize) + 1 !== page;
            });
            pageButtons.forEach(function (button, index) {
                const selected = index + 1 === page;
                button.classList.toggle('active', selected);
                if (selected) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
            });
        }

        for (let page = 1; page <= pageCount; page++) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = String(page);
            button.setAttribute('aria-label', 'Show project page ' + page);
            button.addEventListener('click', function () { showProjectPage(page); });
            projectPagination.appendChild(button);
            pageButtons.push(button);
        }
        showProjectPage(1);
    }

    document.querySelectorAll('.project-preview img').forEach(function (preview) {
        preview.addEventListener('error', function () {
            preview.hidden = true;
            preview.parentElement.classList.add('preview-failed');
        });
    });

    const toggle = document.querySelector('.navigation-toggle');
    const menu = document.querySelector('#navbarCollapse');
    if (toggle && menu) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'navbarCollapse');
        toggle.addEventListener('click', function () {
            const open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.querySelectorAll('[data-ui-toggle="pill"]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const target = document.querySelector(button.getAttribute('href'));
            if (!target) return;
            button.closest('.skill-tabs').querySelectorAll('button').forEach(function (tab) {
                tab.classList.remove('active');
            });
            target.parentElement.querySelectorAll('.skill-panel').forEach(function (pane) {
                pane.classList.remove('active');
            });
            button.classList.add('active');
            target.classList.add('active');
        });
    });
});
