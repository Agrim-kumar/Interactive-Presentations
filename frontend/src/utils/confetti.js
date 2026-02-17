// Confetti celebration effect
export const createConfetti = () => {
    const colors = ['#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = 2 + Math.random() * 2 + 's';

        // Random shapes
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        } else if (Math.random() > 0.5) {
            confetti.style.transform = 'rotate(45deg)';
        }

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
};

// Enhanced toast with confetti
export const showToastWithConfetti = (message, type = 'success') => {
    if (type === 'success') {
        createConfetti();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};
