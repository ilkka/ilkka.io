function setupHeaderBackground() {
    let el = document.getElementById('header-with-changing-background');

    if (el) {
        let hour = moment().hour();
        let newClass = (hour => {
            if (hour >= 4 && hour < 12) {
                return 'morning';
            } else if (hour >= 12 && hour < 20) {
                return 'evening';
            } else {
                return 'night';
            }
        })(hour);
        el.className = el.className + ' ' + newClass;
        el.setAttribute('data-midnight', 'header-' + newClass);
    }

    // set up midnight
    $('.nav--main').midnight();
}

window.addEventListener('load', setupHeaderBackground, false);
