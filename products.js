// ===========================================
// Products Page - Filtering & Search
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const categorySections = document.querySelectorAll('.product-category-section');
    const searchInput = document.getElementById('product-search');
    
    let currentCategory = 'all';
    let currentSearch = '';
    
    // Filter by category
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.dataset.category;
            filterProducts();
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase().trim();
            filterProducts();
        });
    }
    
    function filterProducts() {
        let visibleCount = 0;
        
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardTitle = card.querySelector('.product-title').textContent.toLowerCase();
            const cardDescription = card.querySelector('.product-description').textContent.toLowerCase();
            
            // Check category match
            const categoryMatch = currentCategory === 'all' || cardCategory === currentCategory;
            
            // Check search match
            const searchMatch = currentSearch === '' || 
                cardTitle.includes(currentSearch) || 
                cardDescription.includes(currentSearch);
            
            if (categoryMatch && searchMatch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Show/hide category sections based on visible products
        categorySections.forEach(section => {
            const visibleCards = section.querySelectorAll('.product-card:not(.hidden)');
            if (visibleCards.length === 0) {
                section.classList.add('hidden');
            } else {
                section.classList.remove('hidden');
            }
        });
        
        // Show no results message if needed
        const existingNoResults = document.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.remove();
        }
        
        if (visibleCount === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            `;
            const productsPage = document.querySelector('.products-page .container');
            const firstSection = productsPage.querySelector('.product-category-section');
            productsPage.insertBefore(noResults, firstSection);
        }
    }
    
    // Smooth scroll to category when filter is clicked
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            if (category !== 'all') {
                const section = document.getElementById(category);
                if (section) {
                    setTimeout(() => {
                        const headerOffset = 150;
                        const elementPosition = section.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            }
        });
    });
    
    // Add stagger animation to cards on load
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        observer.observe(card);
    });
});
