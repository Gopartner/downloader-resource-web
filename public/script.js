// scripts.js

document.getElementById('downloadForm').addEventListener('submit', function(event) {
    const button = event.target.querySelector('button');
    button.disabled = true;
    button.innerHTML = 'Downloading...';

    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = 'Download';
    }, 5000); // Simulasi waktu download
});

