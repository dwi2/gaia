'use strict';
(function(window) {
  var elemPanel = document.getElementById('panel'),
    elemMenu = document.getElementById('menu');

  function add(evt) {
    var elem = document.createElement('div'),
      closeBtn = document.createElement('div'),
      iframe = document.createElement('iframe');
    console.log(evt.target.id);
    if (evt.target.id === '3D') {
      iframe.src = 'app://crystalskull.gaiamobile.org/index.html';
    } else if (evt.target.id === '2D') {
      iframe.src = 'app://mobile-html5-gaming-test.gaiamobile.org/index.html';
    } else { // click on something else
      return;
    }
    iframe.className = 'browser-tab app-frame';
    iframe.setAttribute('mozbrowser', true);
    iframe.setAttribute('remote', true);
    closeBtn.textContent = '[X]';
    closeBtn.className = 'frame-close-button';
    elem.className = 'oframe';
    elem.appendChild(iframe);
    elem.appendChild(closeBtn);
    elemPanel.appendChild(elem);
  }

  function panelClickHandler(evt) {
    var oframeToRemove;

    console.log(evt.target.className);

    if (evt.target.classList.contains('frame-close-button')) {
      oframeToRemove = evt.target.parentElement;
      oframeToRemove.remove();
    }
  }

  elemMenu.addEventListener('click', add);

  elemPanel.addEventListener('click', panelClickHandler);
}(window));