const durationSelect = document.getElementById('duration');
const totalAmountSpan = document.getElementById('total-amount');

const prices = {
    '5': 5000,
    '10': 8000,
    '15': 10000
};

durationSelect.addEventListener('change', () => {
    const duration = durationSelect.value;
    const price = prices[duration];
    totalAmountSpan.textContent = `₦${price.toLocaleString()}`;
});
