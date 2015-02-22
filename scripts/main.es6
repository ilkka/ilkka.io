function setupHeaderBackground() {
    let el = document.getElementById('header-with-changing-background');

    if (el) {
        let hour = moment().hour();
        el.className = el.className + ' ' + (hour => {
            if (hour >= 4 && hour < 12) {
                return 'morning';
            } else if (hour >= 12 && hour < 20) {
                return 'evening';
            } else {
                return 'night';
            }
        })(hour);
    }
}

window.addEventListener('load', setupHeaderBackground, false);
