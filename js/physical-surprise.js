const celebrationTypeSelect = document.getElementById('celebration-type');
const customCelebrationTypeGroup = document.getElementById('custom-celebration-type-group');
const packageSelect = document.getElementById('package');
const customPackageOptions = document.getElementById('custom-package-options');
const cakeTypeSelect = document.getElementById('cake-type');
const frameSizeSelect = document.getElementById('frame-size');
const totalAmountSpan = document.getElementById('total-amount');

const packagePrices = {
    'basic': 30000,
    'standard': 45000,
    'premium': 70000,
    'gold': 90000,
    'platinum': 150000,
    'custom': 0
};

const cakePrices = {
    'vanilla': 5000,
    'chocolate': 6000,
    'red-velvet': 7000,
    'fruit': 8000
};

const framePrices = {
    'small': 3000,
    'medium': 5000,
    'large': 7000
};

function calculateTotal() {
    let total = 0;
    const selectedPackage = packageSelect.value;

    if (selectedPackage === 'custom') {
        total += cakePrices[cakeTypeSelect.value];
        total += framePrices[frameSizeSelect.value];
    } else {
        total = packagePrices[selectedPackage];
    }

    totalAmountSpan.textContent = `₦${total.toLocaleString()}`;
}

celebrationTypeSelect.addEventListener('change', () => {
    if (celebrationTypeSelect.value === 'custom') {
        customCelebrationTypeGroup.style.display = 'block';
    } else {
        customCelebrationTypeGroup.style.display = 'none';
    }
});

packageSelect.addEventListener('change', () => {
    if (packageSelect.value === 'custom') {
        customPackageOptions.style.display = 'block';
    } else {
        customPackageOptions.style.display = 'none';
    }
    calculateTotal();
});

cakeTypeSelect.addEventListener('change', calculateTotal);
frameSizeSelect.addEventListener('change', calculateTotal);

calculateTotal();
