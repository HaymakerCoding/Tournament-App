
const host = window.location.host;
let id;
switch(host) {
  case 'www.citymatchplay.golf' : {
    id = 'UA-156445044-7';
    break;
  }
  case 'ottawacitizenchampionship.golf' : {
    id = 'UA-156445044-8';
    break;
  }
  default: {
    id = 0;
    console.log('Could not match host: ' + host + ' for google tags');
    break;
  }
}

// Google Tag Manager
/*
(w,d,s,l,i) => {
  w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}
(window,document,'script','dataLayer','GTM-T3MWLXT');
*/


const URL = 'https://www.googletagmanager.com/gtag/js?id=' + id;
const script = document.createElement('script');
script.src = URL;
console.log('loaded: ' + URL)
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());


function getId() {
  console.log('get id called, ' + id);
  return id;
}

