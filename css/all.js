/*
    Animations used in Magic Land Mobile
*/
@-webkit-keyframes popOverlay {
  0% {
    opacity: 0;
    -webkit-transform: scale(0.3);
  }
  50% {
    opacity: 1;
    -webkit-transform: scale(1.05);
  }
  70% {
    -webkit-transform: scale(0.9);
  }
  100% {
    -webkit-transform: scale(1);
  }
}
@-webkit-keyframes appear {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@-webkit-keyframes bounce {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(20%, 0, 0);
  }
}
@-webkit-keyframes shake {
  from {
    -webkit-transform: rotate(0);
  }
  25% {
    -webkit-transform: rotate(-6deg);
  }
  75% {
    -webkit-transform: rotate(6deg);
  }
  to {
    -webkit-transform: rotate(0);
  }
}
@-webkit-keyframes blink-in {
  to {
    top: 12px;
    opacity: 1;
  }
}
@-webkit-keyframes blink-out {
  to {
    top: 0px;
    opacity: 0;
  }
}
@-webkit-keyframes revealandslideOutter {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@-webkit-keyframes revealandslideInner {
  0% {
    width: 0;
  }
  10% {
    width: 0;
  }
  90% {
    width: 100%;
  }
  100% {
    width: 100%;
  }
}
@-webkit-keyframes fadePlusSlideUp {
  0% {
    margin-top: -100px;
  }
  10% {
    margin-top: -50px;
  }
  90% {
    margin-top: -50px;
  }
  100% {
    margin-top: -120px;
  }
}
@-webkit-keyframes floatUp {
  0% {
    margin-top: -50px;
  }
  100% {
    margin-top: -120px;
  }
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  @-webkit-keyframes floatUp {
    0% {
      margin-top: -100px;
    }
    100% {
      margin-top: -240px;
    }
  }
}
@-webkit-keyframes pulse {
  from {
    -webkit-transform: scale(0.95);
  }
  to {
    -webkit-transform: scale(1.05);
  }
}
@-webkit-keyframes fadeout-unlockable {
  from {
    opacity: 1;
  }
  99% {
    display: block;
  }
  to {
    opacity: 0;
    display: none;
  }
}
animations.css
app.css
castle-complete.css
dev-menu.css
font.css
goals.css
hud.css
main.css
popup.css
shop.css
ui.css
#castle-complete .head {
  background: url("../images/popup/shop_ribbon-nodiamonds.png") no-repeat;
  background-size: 100%;
  width: 228px;
  height: 39px;
  margin: 7px auto 5px;
  position: relative;
  left: -23px;
  /* to compensate for cancel button */

}
#castle-complete div.head h1 {
  width: 105px;
  position: absolute;
  right: 0px;
  font: 20px/38px GrilledCheeseBTNCn, sans-serif;
  text-align: center;
  text-transform: capitalize;
}
#castle-complete div.items {
  padding: 10px 0px;
  position: relative;
  left: 0;
  right: 0;
  bottom: 0;
  top: 10px;
  overflow: hidden;
}
#castle-complete hr {
  bottom: 70px;
  position: absolute;
  display: none;
}
#castle-complete .description .embossed {
  padding-bottom: 20px;
}
#castle-complete .description {
  text-align: center;
  position: relative;
  z-index: 12000;
}
#castle-complete .description button {
  margin: -15px auto 0;
}
#castle-complete div.items .requiredItems li {
  height: 80px;
  -webkit-transform: translate3d(0, 0, 0);
}
#castle-complete .specification {
  padding: 8px 10px 10px 70px;
}
#castle-complete div.items .requiredItems li .invited {
  display: block;
  height: 45px;
  margin-top: -12px;
  text-indent: -10000;
  background: url(../images/popup/tick.png) no-repeat center;
}
#castle-complete .image {
  width: 50px;
  height: 50px;
  margin: 8px;
  border: 2px solid #85511e;
  border-radius: 6px;
  float: left;
  margin-right: 10px;
  background: #76cffa url(../images/popup/unknown.png) no-repeat center;
  background-size: 100%;
  position: relative;
}
#castle-complete .specialistImg {
  width: 50px;
  height: 35px;
  float: left;
  margin-left: 5px;
  margin-top: -3px;
  position: relative;
}
#castle-complete img {
  visibility: hidden;
  height: 100%;
  width: 100%;
  position: relative;
}
#castle-complete h6 {
  color: #6e1700;
  text-transform: capitalize;
  line-height: 20px;
  font-size: 20px;
  padding: 0;
  margin: 0 0 10px 0;
  display: block;
}
#castle-complete .specification {
  text-align: center;
}
#castle-complete button.purchaseItem {
  display: inline-block !important;
  margin: -25px 10px 0 10px;
  font-family: GrilledCheeseBTNCn, sans-serif;
}
li.unaffordable .purchaseItem {
  display: inline-block !important;
  margin: -25px 10px 0 10px;
  background-color: brown;
  border-color: brown;
}
#castle-complete .checkout {
  position: static;
  text-align: center;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  #castle-complete .head {
    background: url("../images/popup/shop_ribbon-nodiamonds.png") no-repeat;
    width: 456px;
    height: 76px;
    margin: 14px auto 10px;
    left: -46px;
    /* to compensate for cancel button */
  
  }
  #castle-complete div.head h1 {
    width: 210px;
    right: 0px;
    font: 40px/76px GrilledCheeseBTNCn, sans-serif, sans-serif;
  }
  #castle-complete div.head div.diamonds {
    display: none;
  }
  #castle-complete .description .embossed {
    padding-bottom: 40px;
  }
  #castle-complete .description button {
    margin: -30px auto 0;
  }
  #castle-complete div.items {
    padding: 20px 0px;
    bottom: 0;
    top: 20px;
  }
  #castle-complete hr {
    bottom: 140px;
  }
  #castle-complete div.items .requiredItems {
    border-width: 6px;
    border-radius: 12px;
    padding-bottom: 12px;
  }
  #castle-complete div.items .requiredItems li {
    margin: 12px 20px 0px 20px;
    height: 160px;
  }
  #castle-complete div.items .requiredItems li:last-child {
    margin-bottom: 40px;
  }
  #castle-complete div.items .requiredItems li .invited {
    height: 90px;
    margin-top: -24px;
    background: url(../images/popup/tick.png) no-repeat center;
    position: relative;
    z-index: 10000;
  }
  #castle-complete .image {
    width: 100px;
    height: 100px;
    border-width: 4px;
    border-radius: 12px;
    margin: 16px 40px 16px 16px;
    background-image: url(../images/popup/unknown.png);
    background-size: 100%;
  }
  #castle-complete .specialistImg {
    width: 99px;
    height: 70px;
    margin-left: 0px;
    margin-top: -6px;
  }
  #castle-complete img {
    visibility: hidden;
  }
  #castle-complete .specification {
    padding: 16px 20px 20px 140px;
  }
  #castle-complete h6 {
    line-height: 40px;
    font-size: 40px;
    margin: 0 0 20px 0;
  }
  #castle-complete button.purchaseItem {
    margin: -50px 20px 0 20px;
  }
}
#dev-menu {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  padding: 80px 0px 0px 60px;
  position: absolute;
  z-index: 1000000000000;
  -webkit-transition: all 0.5s ease-in;
  -webkit-transform: scale(0);
  background: rgba(0, 0, 0, 0.8);
}
#dev-menu.active {
  -webkit-transform: scale(1);
}
#dev-menu h2 {
  -webkit-transform: rotate(1deg);
  color: white;
  font: 45px GrilledCheeseBTNCn, sans-serif;
  left: 20px;
  overflow: hidden;
  padding: 0;
  margin: -10px 0 0 120px;
  position: relative;
  right: 0px;
  text-overflow: ellipsis;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  top: -50px;
}
#dev-menu button {
  width: 80%;
  margin-left: 5%;
  margin-bottom: 0px;
  padding: 15px 0;
}
#dev-menu button.cancel {
  text-indent: -1000px;
  width: 90px;
  height: 90px;
  position: absolute;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  right: 32px;
}
body {
  font-family: sans-serif;
}
@font-face {
  font-family: 'GrilledCheeseBTN';
  font-weight: normal;
  font-style: normal;/*
      you can get the font here:
      http://www.myfonts.com/fonts/btn/grilled-cheese-btn/
      src: url(data:font/opentype;charset=utf-8;base64,.....) format('truetype');
      */
}
@font-face {
  font-family: 'GrilledCheeseBTNCn';
  font-weight: normal;
  font-style: normal;/*
      you can get the font here:
      http://www.myfonts.com/fonts/btn/grilled-cheese-btn/cn/
      src: url(data:font/opentype;charset=utf-8;base64,.....) format('truetype');
      */
}
.xgoals {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: rgba(0, 0, 0, 0.7) url("../images/popup/paper-big.png") no-repeat center;
  z-index: 10000;
}
.ipad .xgoals {
  width: 640px;
  height: 840px;
  top: 50%;
  left: 50%;
  margin: -420px 0 0 -320px;
  background-color: transparent;
}
.fullscreen .xgoals {
  background-size: 110% 110%;
}
.xgoals .gold {
  display: inline-block;
  padding: 10px 10px 10px 54px;
  background: url(../images/status/coins-small.png) no-repeat 14px center;
}
.xgoals .head {
  background: url(../images/popup/goal-header.png) no-repeat center 16px;
  height: 196px;
}
.xgoals .head .gold {
  position: absolute;
  top: 46px;
  left: 300px;
  font: bold 28px/42px sans-serif;
  color: #fff;
  text-shadow: 1px 1px 2px #000;
  -webkit-transform: rotate(1deg);
}
.xgoals h1 {
  font: 36px/108px GrilledCheeseBTNCn, sans-serif;
  color: #d90326;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.xgoals .head h1 {
  position: absolute;
  top: 90px;
  left: 290px;
  right: 0px;
  margin-right: 132px;
  text-align: center;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  -webkit-transform: rotate(1deg);
}
.xgoals .subgoals {
  position: absolute;
  top: 200px;
  left: 52px;
  right: 52px;
  height: 590px;
  overflow: hidden;
}
.xgoals .subgoals ul {
  -webkit-transform: translate3d(0, 0, 0);
  overflow: hidden;
}
.xgoals hr {
  position: absolute;
  height: 28px;
  width: 100%;
  margin-top: -4px;
  border: none;
  z-index: 1000;
  background: url(../images/popup/goal-hr.png) no-repeat center;
}
.xgoals .subgoals + hr {
  margin-top: 580px;
}
.xgoals .subgoals li {
  display: -webkit-box;
  height: 224px;
  margin: 6px 0;
  text-align: center;
  background: #fdf7e5 url(../images/popup/item.png) no-repeat center;
  background-size: 100% 100%;
  border: 1px solid brown;
  border-radius: 20px;
  color: #977f63;
  pointer-events: none;
  -webkit-transform: translate3d(0, 0, 0);
}
.subgoals li, .subgoals .gold {
  font-family: GrilledCheeseBTNCn;
  font-size: 28px;
}
.thumbnail {
  width: 120px;
  margin: 0 10px;
  display: -webkit-box;
  -webkit-box-pack: center;
  -webkit-box-orient: vertical;
}
.thumbnail img {
  max-width: 120px;
}
.thumbnail figure {
  display: block;
  margin: 0;
}
.done .thumbnail:after {
  content: "DONE";
  color: #f00;
  padding: 5px 15px;
  border: 4px solid #f00;
  border-radius: 10px;
  position: absolute;
  -webkit-transform: rotate(-5deg) translate(40px, -20px);
  font: normal 36px/24px GrilledCheeseBTNCn, sans-serif;
}
.done .thumbnail figure {
  visibility: hidden;
}
.xgoals .description {
  -webkit-box-flex: 1;
  padding: 0 20px;
  margin: 20px 0;
  border-left: 4px solid #c3b096;
}
.description h5 {
  margin: 10px 0 0 0;
  padding: 0;
  font-size: 30px;
  line-height: 36px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 5px 0;
}
.description p {
  line-height: 36px;
  padding: 5px 0;
  min-height: 72px;
  margin: 0;
  color: #b53a26;
}
.reward {
  font: normal 36px/36px GrilledCheeseBTNCn;
  padding: 5px 10px;
}
.reward .button {
  font: normal 36px/36px GrilledCheeseBTNCn;
  display: none;
  margin: -5px -10px;
  padding: 10px 30px 4px;
  pointer-events: auto;
  -webkit-animation-name: pulse;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-duration: .8s;
  -webkit-animation-direction: alternate;
  -webkit-animation-timing-function: ease;
}
.done .reward .details {
  display: none;
}
.done .reward .button {
  display: inline-block;
  font-size: 30px;
  padding: 10px 0 0 0;
  width: 330px;
}
.collected .reward .button {
  display: none;
}
.reward .gold {
  font: normal 36px/36px GrilledCheeseBTN;
  padding-top: 5px;
  padding-bottom: 5px;
}
.collected .reward, .done .reward.no-rewards {
  background: url(../images/popup/tick.png) no-repeat center;
  height: 70px;
}
.goals .finished {
  position: absolute;
  z-index: 1500;
  left: 0;
  right: 0;
  height: 636px;
  text-align: center;
  background: url(../images/popup/reward-paper.png) no-repeat center;
  display: none;
}
.finished.active, [data-state="3"] .finished {
  margin: 0;
  display: block;
  bottom: 0;
  -webkit-animation-name: popOverlay;
  -webkit-animation-duration: .8s;
  -webkit-animation-iteration-count: 1;
  -webkit-animation-timing-function: ease-in;
}
.finished .bubble {
  border-radius: 24px;
  border: 2px solid #d7ac78;
  position: absolute;
  padding: 20px 20px 20px 30px;
  margin: -1000px 20px 0 250px;
  text-align: left;
  background: #fff;
  color: #854c1f;
  font: normal 36px/42px GrilledCheeseBTNCn;
  -webkit-box-shadow: 0 3px 10px #000;
}
.finished.active .bubble, [data-state="3"] .finished .bubble, .finished.active .bubble {
  margin-top: -150px;
  -webkit-animation-name: appear;
  -webkit-animation-duration: .5s;
  -webkit-animation-delay: .8s;
  -webkit-animation-iteration-count: 1;
  -webkit-animation-timing-function: ease-in;
  -webkit-animation-fill-mode: backwards;
}
.finished h1 {
  height: 200px;
  padding-left: 10px;
  margin: 0;
  line-height: 200px;
  font-size: 50px;
}
.finished h2 {
  margin: 0;
  height: 60px;
  font: normal 36px/60px GrilledCheeseBTN;
}
.finished .details {
  margin: 0;
  height: 230px;
  color: #854c1f;
  font: normal 50px GrilledCheeseBTN;
}
.finished .xp {
  display: inline-block;
  background: url(../images/popup/xp.png) no-repeat right center;
  background-size: 48px 48px;
  padding-right: 60px;
  padding-left: 20px;
  height: 160px;
  line-height: 168px;
}
.finished .gold {
  display: inline-block;
  height: 160px;
  line-height: 168px;
}
.finished button {
  margin-top: 20px;
  font: normal 36px/36px GrilledCheeseBTN;
}
/* OLD */
#goals-drawer {
  height: 131px;
}
#goals-drawer a figure {
  margin: 0;
  padding: 0;
  outline: 1px solid yellow;
  display: block;
}
.goalIcon {
  display: block;
  height: 131px;
  background: url(../images/hud/tasklist.png) no-repeat 0 -131px;
}
.goalIcon:active {
  background-position: 0 -1px;
}
.goalIcon:after {
  position: absolute;
  display: block;
  right: 5px;
  top: 30px;
}
.goalIcon[data-notif-count]:after {
  content: attr(data-notif-count);
  font: bold 20px/30px sans-serif;
  box-shadow: 1px 1px 2px #900 inset;
  text-shadow: 1px 1px 2px #000;
  background: #f00;
  color: #fff;
  border: 4px solid #fff;
  border-radius: 20px;
  padding: 0 10px;
}
.goalIcon figure {
  display: none!important;
}
.goals {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: #fff;
  z-index: 10000;
  display: block;
  opacity: 1;
  -webkit-transition: opacity 0.4s, -webkit-transform 0.4s;
  -webkit-transform: scale(1, 1);
  -webkit-transform-origin: 10% 100%;
}
.goals.hidden {
  display: block;
  pointer-events: none;
  opacity: 0;
  -webkit-transform: scale(0, 0);
}
.goals .subgoals li:first-child {
  margin-top: 20px;
}
.goals .subgoals li:last-child {
  margin-bottom: 32px;
}
.goals .subgoals .panel .stat {
  position: absolute;
  text-align: center;
  width: 156px;
  margin-top: 110px;
  font: normal 36px/56px GrilledCheeseBTN, sans-serif;
}
.goals .subgoals .panel div.image {
  float: left;
  width: 144px;
  min-height: 120px;
  display: -webkit-box;
  -webkit-box-pack: center;
  -webkit-box-align: center;
}
.goals .subgoals .pay div.image {
  padding-top: 1em;
}
.goals .subgoals .panel div.image img {
  max-height: 120px;
  display: -webkit-box;
}
.goals .subgoals .panel div.specification {
  margin: 10px 10px 10px 160px;
  text-align: center;
}
.goals .hint, .goals .panel .info {
  color: #dc3d1d;
}
.goals .panel .info {
  font-family: GrilledCheeseBTN, sans-serif;
}
.goals .subgoals .specification button {
  margin: -50px auto 10px;
}
.goals .subgoals .pay-hint,
.goals .subgoals .pay.done .pay-hint,
.goals .subgoals .panel .pay,
.goals .subgoals .panel.done.pay .pay,
.goals .subgoals .pay .stat,
.goals .subgoals .pay .hint {
  display: none;
}
.goals .subgoals .pay .pay-hint, .goals .subgoals .pay .pay {
  display: inline-block;
}
.subgoals .panel.done .specification:after {
  display: block;
  content: " ";
  position: relative;
  width: 72px;
  height: 72px;
  margin: -30px auto 18px;
  background: url(../images/popup/tick.png) 0 0 no-repeat;
  -webkit-background-size: contain;
}
.goal-screen-subgoals .subgoals .panel.done button {
  display: none;
}
.goals h6 {
  margin: 0;
  padding: 0;
  font: normal 36px/56px GrilledCheeseBTN, sans-serif;
  display: block;
  letter-spacing: 0;
  text-align: center;
}
.goals .rewards .embossed {
  display: -webkit-box;
  height: 160px;
}
.goals .rewards figure {
  margin: 0;
  font: 26px/32px GrilledCheeseBTNCn, sans-serif;
  padding-top: 112px;
  background-size: 80px;
  color: #543001;
  -webkit-box-flex: 1;
  margin: 0;
  text-align: center;
  text-transform: capitalize;
  display: block;
}
.goals .no.rewards p {
  font: normal 40px/60px GrilledCheeseBTN, sans-serif;
  text-shadow: 0 1px 0px #ffdc87;
  color: #422806;
  text-align: center;
  padding: 40px 0 10px;
}
.goals .rewards .embossed {
  height: 80px;
}
.goals .rewards figure.gold {
  background: url(../images/popup/coins.png) 50% 20px no-repeat;
}
.goals .rewards figure.food {
  background: url(../images/popup/food.png) 50% 20px no-repeat;
}
.goals .rewards figure.xp {
  background: url(../images/popup/xp.png) 50% 20px no-repeat;
  text-transform: uppercase;
}
.goals.drydock .page .head {
  height: auto;
}
.goals.drydock .page .head h1 {
  position: relative;
}
.goals.drydock .page .head h1:after {
  content: url(../images/popup/ship_image.png);
  display: block;
  width: 281px;
  height: 154px;
  position: relative;
  margin: 20px auto 20px 15px;
}
.goals .hint {
  font-size: 30px;
}
.goals .screen {
  display: none;
}
.goals[data-state="-1"] .screen.drydock-screen-repairing {
  display: block;
}
.hidden {
  display: none;
  pointer-events: none!important;
  opacity: 0;
}
.goals.hidden {
  display: block;
}
.goals.drydock .share.embossed, .goals.drydock hr {
  display: none;
}
[data-state="3"] .cancel {
  display: none;
}
#hud-goals.shake .goalIcon {
  -webkit-animation-name: shake;
  -webkit-animation-duration: .2s;
  -webkit-animation-iteration-count: 20;
  -webkit-animation-fill-mode: alternate;
}
html,
body,
header,
aside nav,
ul,
li,
section,
h1,
label {
  margin: 0;
  padding: 0;
  display: block;
  font-family: sans-serif;
}
header .board {
  position: absolute;
  width: 580px;
  height: 65px;
  left: 50%;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 10px;
  z-index: -1;
  margin: 8px 0 0 -290px;
  padding-top: 0;
}
header {
  position: absolute;
  width: 100%;
  left: 0;
  top: -5px;
  padding-top: 10px;
  z-index: 1101;
  text-align: center;
  color: #fff;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  border-radius: 10px;
}
header > div {
  display: inline-block;
  margin: 22px 10px 0;
  width: 100px;
  height: 80px;
  vertical-align: top;
}
header #coins,
header #food,
header #population,
header #level {
  margin-top: 1px;
  padding-top: 20px;
}
header div.doober-tooltips {
  pointer-events: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  position: absolute;
  text-align: center;
  width: 100%;
  display: block;
  margin: 0;
  top: 50px;
  overflow: hidden;
}
#ui #main-stats .doober-tooltips {
  pointer-events: none;
}
header div.doober-tooltip {
  display: inline-block;
  text-shadow: 1px 1px 0px black;
  font: normal 28px/62px GrilledCheeseBTNCn;
  width: 100px;
  margin: 0 10px;
  -webkit-transition: all .3s;
  -webkit-transform: translate3d(0, -100%, 0);
  text-align: center;
  color: #fff;
}
header div.doober-tooltip.on {
  -webkit-transform: translate3d(0, 0, 0);
}
header div.doober-tooltip[data-for=food] {
  margin-left: 20px;
}
header div.doober-tooltip[data-for=level] {
  margin-left: 140px;
}
header #coins {
  text-shadow: 2px 2px 4px #000;
  font: bold 28px/62px sans-serif;
  background: transparent url(../images/status/coins.png) no-repeat 0 10px;
  padding-left: 60px;
  width: auto;
  text-align: left;
  height: 60px;
  top: -11px;
  position: relative;
}
header .info {
  position: absolute;
  background: #f50a11;
  border: 4px solid #fff;
  border-radius: 10px;
  padding: 4px 10px;
  font: bold 22px/30px sans-serif;
  margin: 60px auto 0;
  min-width: 72px;
  -webkit-transform: translate(0, 0);
  -webkit-box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
  -webkit-animation-name: blink-out;
  -webkit-animation-duration: 1s;
  -webkit-animation-delay: 2s;
  -webkit-animation-fill-mode: forwards;
  -webkit-animation-timing-function: steps(1);
  top: 12px;
}
header .info:before {
  content: ' ';
  width: 14px;
  height: 14px;
  background: #000;
  border-left: 4px solid #fff;
  border-top: 4px solid #fff;
  position: absolute;
  margin: -16px 0 0 26px;
  -webkit-transform: rotate(45deg);
}
header .active .info,
header :active .info {
  -webkit-animation-name: blink-in;
  -webkit-animation-duration: 1s;
  -webkit-animation-fill-mode: forwards;
}
header .bar {
  height: 32px;
  background: #f50a11;
  border: 4px solid #fff;
  border-left: none;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
header .bar:before {
  content: ' ';
  width: 40px;
  height: 60px;
  margin: -10px 0 0 -20px;
  position: absolute;
}
header #food {
  margin-left: 38px;
}
header #food .bar:before {
  content: ' ';
  width: 66px;
  margin: -14px 0 0 -38px;
  background: url(../images/status/food.png) no-repeat;
}
header #population .bar {
  margin-left: 18px;
  background: #813206;
  -webkit-box-shadow: 0 0 4px #923907 inset;
}
header #population .bar:before {
  width: 52px;
  margin: -14px 0 0 -26px;
  background: url(../images/status/population.png) no-repeat;
}
header #population .info {
  background: #813206;
}
header #population .info:before {
  /*display: none;*/

}
header #level {
  margin-left: 26px;
}
header #level .bar {
  background: #0b3bab;
}
header #level .bar:before {
  content: attr(title);
  width: 52px;
  margin: -14px 0 0 -26px;
  background: url(../images/status/level.png) no-repeat;
  font-size: 20px;
  line-height: 62px;
  text-shadow: 0 0 4px #fff;
  color: #0587f5;
}
header .progress {
  height: 32px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, rgba(0, 0, 0, 0)), color-stop(0.2, rgba(255, 255, 255, 0.4)), color-stop(1, rgba(0, 0, 0, 0)));
}
header #food .progress,
header #food .info,
header #food .info:before {
  background-color: #f344b8;
}
header #food .progress,
header #population .progress {
  width: 60%;
  /* fixed width as long as there is no food limit */

}
#ratio {
  text-shadow: 0 1px 1px #813206;
  font: bold 22px/32px sans-serif;
  width: 100%;
}
header #level .progress,
header #level .info,
header #level .info:before {
  background-color: #179df1;
}
header #population .progress,
header #population .info,
header #population .info:before {
  background-color: #ffa200;
}
/* Navigation */
nav,
aside {
  position: absolute;
  bottom: 0;
  z-index: 5000;
  height: 131px;
}
nav {
  width: 239px;
  height: 131px;
  right: 0;
  display: -webkit-box;
}
aside {
  pointer-events: none!important;
  width: 142px;
  left: 0;
}
aside * {
  pointer-events: auto;
}
nav a,
aside a {
  text-decoration: none;
  -webkit-touch-callout: none;
}
nav a {
  background: url(../images/hud/nav.png) no-repeat;
  text-indent: -10000px;
  height: 131px;
  display: block;
  position: absolute;
}
aside a {
  text-indent: 0;
  display: block;
  width: 142px;
}
#hud-goals {
  background: url(../images/hud/goal_button.png) no-repeat left bottom;
}
#showShopButton {
  background-position: left bottom;
  width: 115px;
}
#showCursorButton {
  background-position: right bottom;
  width: 124px;
  margin-left: 115px;
}
#showShopButton.active,
#showShopButton:active {
  background-position: left -1px;
}
#showCursorButton.active,
#showCursorButton:active {
  background-position: right -1px;
}
#shop article {
  display: none;
}
#shop article.active {
  display: block;
}
/* HUDs for Game Modes */
.hud_mode {
  z-index: 1000;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: none;
}
.hud_mode button.close {
  position: absolute;
  -webkit-appearance: none;
  margin: 0;
  border: 0;
  padding: 0;
  left: 50%;
  top: 12px;
  margin-left: 220px;
  width: 92px;
  height: 92px;
  background: url("../images/popup/close_button.png") no-repeat 0 0;
}
.hud_mode button.close:active {
  background-position: -92px 0;
}
.hud_mode .specification {
  padding: 18px 54px 20px 160px;
}
.hud_mode.seed .specification {
  padding-left: 180px;
}
.hud_mode.info,
.hud_mode.shop,
.hud_mode.seed,
.hud_mode.roads,
.hud_mode.move {
  pointer-events: none;
}
.hud_mode h6,
.hud_mode p {
  margin: 0 0 4px 0;
  padding: 0;
  font-size: 20px;
  line-height: 22px;
}
.hud_mode.seed .gold {
  display: inline-block;
  position: absolute;
  font-style: normal;
  color: white;
  font-weight: bold;
  left: 58px;
  top: 102px;
  font-size: 24px;
}
.hud_mode.seed p {
  padding-top: 6px;
  color: #6e1700;
  font: normal 26px/32px GrilledCheeseBTN, sans-serif;
}
.hud_mode .progress {
  width: 250px;
  margin: 0 auto;
  border: 4px solid #52b417;
  border-radius: 12px;
  overflow: hidden;
  background: #a24f7b;
}
.hud_mode .progress div {
  height: 12px;
  border-radius: 7px;
  background: #84d024;
}
.hud_mode .infoPanel {
  text-align: center;
  padding: 0;
  margin: 0 auto;
}
.hud_mode.info .infoPanel {
  width: 561px;
  height: 120px;
  font: normal 40px/120px GrilledCheeseBTNCn, sans-serif;
  color: #2f0101;
}
.hud_mode.roads .infoPanel {
  background: url(../images/mode/roadModeInfoPanelBg.png) no-repeat center top;
  width: 518px;
  height: 123px;
}
.hud_mode.move .infoPanel,
.hud_mode.shop .infoPanel {
  background: url(../images/mode/moveModeInfoPanelBg.png) no-repeat center top;
  width: 511px;
  height: 120px;
}
.hud_mode.seed .infoPanel {
  background: url(../images/mode/panelWithGoldDisplay.png) no-repeat center top;
  width: 531px;
  height: 140px;
  position: relative;
}
.hud_mode.shop h6 {
  display: none;
}
.hud_mode.shop p {
  padding-top: 6px;
  color: #6e1700;
  font: normal 26px/32px GrilledCheeseBTNCn, sans-serif;
}
.destroy_entity .infoPanel,
.castle_upgrade .infoPanel {
  background: #fdf7e1 url(../images/popup/pergament.png) center;
  background-size: 100% 100%;
  border: 2px solid #fff;
  position: absolute;
  -webkit-transform: scale(0) translate3d(0, 0, 0);
  border-width: 4px;
  border-radius: 20px;
  padding: 20px 20px;
  width: 460px;
  margin: 0px 0 0 -250px;
}
.destroy_entity,
.castle_upgrade {
  display: block;
}
.destroy_entity.active .infoPanel,
.castle_upgrade.active .infoPanel {
  -webkit-transform: scale(1) translate3d(0, 0, 0);
  -webkit-transition: -webkit-transform 0.2s linear;
  -webkit-backface-visibility: hidden;
}
.destroy_entity p.specification,
.castle_upgrade p.specification {
  font: normal 32px/32px GrilledCheeseBTNCn;
  color: #6e1700;
  padding: 0!important;
}
.destroy_entity .menu,
.castle_upgrade .menu {
  border: 2px solid #c6ad84;
  background: #fff7e7;
  margin: 16px 38px 0 30px;
  height: 70px;
  border-radius: 10px;
  display: -webkit-box;
  pointer-events: auto;
}
.destroy_entity .menu a,
.castle_upgrade .menu a {
  display: -webkit-box;
  -webkit-box-flex: 1;
  width: 50%;
  text-decoration: none;
  text-indent: -10000px;
  background-position: center;
  background-repeat: no-repeat;
  margin: -10px 0;
}
.destroy_entity .menu a.cancel,
.castle_upgrade .menu a.cancel {
  background-image: url(../images/hud/cancel_icon.png);
}
.destroy_entity .menu a.confirm,
.castle_upgrade .menu a.confirm {
  background-image: url(../images/hud/ok_icon.png);
}
.destroy_entity .menu a:active:before,
.castle_upgrade .menu a:active:before {
  content: " ";
  width: 170px;
  eight: 130px;
  margin: -30px 0 0 8px;
  position: absolute;
  background-image: -webkit-gradient(radial, center center, 0, center center, 50, from(#ffff00), to(rgba(255, 255, 0, 0)));
}
.destroy_entity .menu a.custom:active:before,
.castle_upgrade .menu a.custom:active:before {
  background: transparent;
  display: none;
}
.hud_mode.seed .infoPanel img {
  width: 80px;
  position: absolute;
  top: 0px;
  margin: 14px 0 0 48px;
}
.hud_mode button {
  -webkit-appearance: none;
  margin: 0;
  border: 0;
  padding: 0;
  pointer-events: auto;
  position: absolute;
  top: 70%;
  width: 100px;
  height: 100px;
}
.hud_mode button[disabled] {
  opacity: 0.5;
  pointer-events: none;
  /* TODO: is it the right way? not */

}
.hud_mode .population {
  font-size: 30px;
  line-height: 40px;
}
.in-place-actions {
  background: url(../images/hud/bg_2_icons.png) bottom center no-repeat;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  width: 225px;
  height: 115px;
  padding-top: 38px;
  margin-left: -112px;
}
.in-place-actions a {
  display: block;
  background: 50% 50% no-repeat;
  background-size: contain;
  float: left;
  width: 96px;
  height: 96px;
  margin-left: 10px;
}
.in-place-actions a.disabled {
  opacity: .4;
}
.in-place-actions a.move {
  background-image: url(../images/hud/move_icon.png);
}
.in-place-actions a.destroy {
  background-image: url(../images/hud/remove_icon.png);
}
.in-place-actions a.upgrade {
  background-image: url(../images/hud/update_icon.png);
}
.in-place-actions a.confirm {
  background-image: url(../images/hud/ok_icon.png);
}
.in-place-actions a.cancel {
  background-image: url(../images/hud/cancel_icon.png);
}
.in-place-actions a:active:before {
  content: " ";
  display: block;
  width: 200px;
  height: 200px;
  margin: -50px 0 0 -50px;
  background-image: -webkit-gradient(radial, center center, 0, center center, 100, from(#ffff00), to(rgba(255, 255, 0, 0)));
}
.in-place-actions a.custom:active:before {
  background: transparent;
  display: none;
}
.ipad .in-place-actions {
  width: 112px;
  height: 57px;
  padding-top: 19px;
  background: url(../images/hud/bg_2_icons.png) bottom center no-repeat;
  background-size: 100%;
  position: absolute;
  top: 0;
  left: 0;
  margin-left: -56px;
  pointer-events: auto;
}
.ipad .in-place-actions a {
  display: block;
  width: 48px;
  height: 48px;
  background: 50% 50% no-repeat;
  background-size: contain;
  margin-left: 5px;
  float: left;
}
.ipad .in-place-actions a.disabled {
  opacity: .4;
}
.ipad .in-place-actions a.move {
  background-image: url(../images/hud/move_icon.png);
}
.ipad .in-place-actions a.destroy {
  background-image: url(../images/hud/remove_icon.png);
}
.ipad .in-place-actions a.upgrade {
  background-image: url(../images/hud/update_icon.png);
}
.ipad .in-place-actions a.confirm {
  background-image: url(../images/hud/ok_icon.png);
}
.ipad .in-place-actions a.cancel {
  background-image: url(../images/hud/cancel_icon.png);
}
.ipad .in-place-actions a:active:before {
  content: " ";
  display: block;
  width: 100px;
  height: 100px;
  margin: -25px 0 0 -25px;
  background-image: -webkit-gradient(radial, center center, 0, center center, 50, from(#ffff00), to(rgba(255, 255, 0, 0)));
}
.ipad .in-place-actions a.custom:active:before {
  background: transparent;
  display: none;
}
.landscape aside,
.landscape nav {
  display: none;
}
.ipad.landscape aside,
.ipad.landscape nav {
  display: block;
}
/* New Info Mode */
.inPlace-info {
  pointer-events: all;
  display: none;
  position: absolute;
  color: #8c5a21;
  width: 350px;
  height: 277px;
  margin: -267px 0 0 -180px;
  background: url(../images/mode/info-panel-up.png) no-repeat;
  z-index: 10300;
  text-align: center;
}
.inPlace-info.reversed {
  background: transparent;
  margin-top: 0;
}
.inPlace-info.reversed:before {
  content: url(../images/mode/info-panel-down.png);
  position: absolute;
  z-index: 100;
}
.inPlace-info.reversed * {
  position: relative;
  z-index: 101;
}
.inPlace-info.reversed button.close {
  top: 10px;
  z-index: 102;
}
.inPlace-info h1 {
  text-shadow: 0 1px 1px #fff;
  margin: 20px 26px 0 18px;
  height: 50px;
  font: normal 32px/50px GrilledCheeseBTNCn, sans-serif;
}
.inPlace-info .specification {
  margin: 0 26px 0 18px;
  height: 60px;
  padding-top: 14px;
}
.inPlace-info .specification p {
  padding: 2px 0;
  font: normal 24px/28px GrilledCheeseBTNCn, sans-serif;
}
.inPlace-info .specification .population {
  font-size: 28px;
  line-height: 36px;
}
.inPlace-info .specification .progress {
  border: 4px solid #52b417;
  width: 250px;
  border-radius: 12px;
  margin: 0 auto;
  overflow: hidden;
  background: #a24f7b;
}
.inPlace-info .specification .progress div {
  height: 16px;
  background: #84d024;
}
.inPlace-info .menu {
  margin: 8px 38px 0 28px;
  height: 70px;
  display: -webkit-box;
}
.inPlace-info .menu a {
  display: -webkit-box;
  -webkit-box-flex: 1;
  width: 50%;
  text-decoration: none;
  text-indent: -10000px;
  background-position: center;
  background-repeat: no-repeat;
  margin: -10px 0;
}
.inPlace-info .menu a.move {
  background-image: url(../images/hud/move_icon.png);
}
.inPlace-info .menu a.destroy {
  background-image: url(../images/hud/remove_icon.png);
}
.inPlace-info .menu a.upgrade {
  background-image: url(../images/hud/update_icon.png);
  background-position: 20px center;
  text-indent: 120px;
  font: normal 40px/90px GrilledCheeseBTNCn, sans-serif;
  color: #8c5a21;
  text-transform: capitalize;
}
.inPlace-info .menu a:active:before {
  width: 170px;
  height: 130px;
  margin: -30px 0 0 -20px;
  background-image: -webkit-gradient(radial, center center, 0, center center, 100, from(#ffff00), to(rgba(255, 255, 0, 0)));
  content: " ";
  position: absolute;
}
.inPlace-info .menu a.custom:active:before {
  background: transparent;
  display: none;
}
.inPlace-info button.close {
  position: absolute;
  -webkit-appearance: none;
  border: 0;
  padding: 0;
  top: 0;
  right: 0;
  margin: -30px -30px 0 0;
  width: 92px;
  height: 92px;
  background: url("../images/popup/close_tooltip_button.png") no-repeat 0 0;
}
.inPlace-info button.close:active {
  background-position: -92px 0;
}
#game_overlay .finished {
  margin-top: 0;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  .ipad .in-place-actions {
    background-size: 100%;
  }
}
/* variables */
html,
body,
h1,
h2,
h3,
h4,
h5,
h6,
p {
  margin: 0;
  padding: 0;
}
html, body {
  position: relative;
}
body {
  overflow: hidden;
  background: #109805 url("../images/load.gif") center no-repeat;
}
*, a, button {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
canvas {
  position: relative;
  z-index: 199;
  display: block;
  -webkit-user-select: none;
}
#info-grid {
  opacity: 0.5;
}
#info-grid, #grid-map {
  left: 0;
  z-index: 200;
  pointer-events: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-transition: opacity .4s;
}
.invisible {
  display: block;
  opacity: 0;
}
#mlm-content {
  background: #109805 repeat 0 0;
}
.time_inc {
  width: 50px;
  height: 50px;
}
#bg,
#game_overlay,
#info-grid,
#grid-map {
  position: absolute;
  margin: 0;
  padding: 0;
  top: 0;
  -webkit-transform: translate3d(0, 0, 0);
  background: transparent no-repeat 0 0;
}
#game_overlay {
  pointer-events: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  z-index: 1000;
}
#game_overlay .actionIcon {
  pointer-events: none;
  opacity: 0;
  background-repeat: no-repeat;
  -webkit-transition: opacity .4s;
  -webkit-transform-origin: 50% 50%;
  -webkit-animation-name: pulse;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-duration: .8s;
  -webkit-animation-direction: alternate;
  -webkit-animation-timing-function: ease;
}
#game_overlay .actionIcon.idle.house {
  -webkit-animation-name: pulse;
}
#game_overlay .actionIcon.paused.statichouse {
  background-size: contain;
  display: block!important;
  opacity: 1;
  -webkit-animation-name: none;
}
#game_overlay, #info-grid, #grid-map {
  width: 1536px;
  height: 1728px;
}
body[data-mode=basic] #game_overlay .actionIcon,
body[data-mode=info] #game_overlay .actionIcon,
body[data-mode=roads] #game_overlay .actionIcon.paused,
body[data-mode=shop] #grid-map,
body[data-mode=roads] #grid-map,
body[data-mode=move] #grid-map {
  opacity: 1;
}
#doobers, #in-place-notifications {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 200000;
}
#in-place-notifications {
  z-index: 200001;
}
#doobers,
#doobers *,
#in-place-notifications,
#in-place-notifications * {
  pointer-events: none!important;
}
#bg {
  width: 1536px;
  height: 1728px;
  z-index: 198;
  background-image: url("../images/entities/backgrounds/coast.png");
}
.actionIcon {
  position: absolute;
  pointer-events: none;
}
body[data-mode=basic] #game_overlay .actionIcon {
  pointer-events: none;
}
#game {
  min-height: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: none;
}
@media all and (min-device-height: 480px) {
  #game {
    min-height: 831px;
    height: 100% !important;
  }
}
body > div.stats {
  position: absolute;
  bottom: 0;
  left: 0;
}
#hud {
  position: absolute;
  top: 3px;
  left: 0;
  right: 0;
  pointer-events: none;
}
#hud div {
  display: inline-block;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: bold;
  font-size: 18px;
  margin-left: 10px;
}
#ui {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
#ui.hide {
  display: none;
}
#ui * {
  pointer-events: auto;
}
div.navigation {
  pointer-events: none;
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
}
div.navigation .buttons {
  pointer-events: auto;
}
#placeButtons {
  pointer-events: auto;
  display: none;
  position: absolute;
  top: 100px;
  z-index: 30001;
}
.anim {
  position: absolute;
  opacity: 0;
  margin-top: 5px;
  background: url("../images/status/emptybar.png") no-repeat 0 100%;
  -webkit-animation-duration: 1s;
  -webkit-animation-name: revealandslideOutter;
  pointer-events: none;
}
.anim .text {
  color: #fff;
  font-family: GrilledCheeseBTNCn, sans-serif;
  text-shadow: -1px -1px 1px #000000;
  text-align: center;
}
.anim .progress {
  width: 0;
  background: url("../images/status/filledbar.png") no-repeat 0 0px;
  -webkit-animation-duration: 1s;
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-name: revealandslideInner;
}
.anim {
  width: 140px;
  margin-left: -70px;
  background: url("../images/status/emptybar.png") no-repeat 0 100%;
}
.anim .text {
  font-size: 27px;
}
.anim .progress {
  height: 40px;
  background: url("../images/status/filledbar.png") no-repeat 0 0px;
}
.quick-notif {
  opacity: 0;
  width: 200px;
  height: 96px;
  margin-left: -100px;
  text-align: center;
  font: normal 14px GrilledCheeseBTNCn, sans-serif;
  color: #fff;
  position: absolute;
  background: no-repeat 0 0;
  background-size: contain;
  -webkit-animation-name: revealandslideOutter, fadePlusSlideUp;
  -webkit-animation-duration: 1.5s;
  pointer-events: none;
  -webkit-user-select: none;
}
.quick-notif.flyout {
  -webkit-animation-name: revealandslideOutter, floatUp;
}
.quick-notif.bonus {
  color: #4ffaf3;
  -webkit-animation-name: revealandslideOutter;
  -webkit-animation-duration: 3.0s;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  .anim {
    -webkit-transform: scale3d(1, 1, 1);
    margin-top: 10px;
  }
  .quick-notif {
    margin-left: -100px;
    font-size: 28px;
  }
  @-webkit-keyframes floatUp {
    0% {
      margin-top: -100px;
    }
    100% {
      margin-top: -240px;
    }
  }
}
.feedback_anim {
  pointer-events: none;
  -webkit-user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 1;
  -webkit-transition: all 2s ease-in, opacity 1.6s 0.4s ease-in;
  -webkit-transform: scale3d(1, 1, 1);
  -webkit-animation: dummy 2.5s 1;
  font: 1.6em/normal GrilledCheeseBTNCn;
  color: white;
  -webkit-text-stroke: 1px black;
}
.feedback_anim.to_level, .feedback_anim.to_xp {
  -webkit-transition-delay: .2s;
}
.feedback_anim img {
  vertical-align: middle;
}
body[data-level-treshold="4"] .feedback_anim {
  -webkit-transition: all .8s, opacity .45s .35s;
  -webkit-animation-duration: .8s;
}
@-webkit-keyframes dummy {
  0% {
    text-align: inherit;
  }
  100% {
    text-align: inherit;
  }
}
.clearfix:before, .clearfix:after {
  content: "\0020";
  display: block;
  height: 0;
  overflow: hidden;
}
.clearfix:after {
  clear: both;
}
.clearfix {
  zoom: 1;
}
.tuthilite {
  pointer-events: none!important;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  display: block;
  outline: 3px solid #64ff64;
  background: rgba(100, 255, 100, 0.4);
  z-index: 10000;
  position: absolute;
}
.tutarrow {
  pointer-events: none!important;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  display: block;
  width: 178px;
  height: 177px;
  position: absolute;
  z-index: 10001;
  -webkit-transform-origin-y: 50%;
}
.tutarrow .arrow {
  background: url(../images/hud/hand.png) no-repeat;
  background-size: contain;
  pointer-events: none!important;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  position: relative;
  left: 0;
  top: 0;
  margin: 0;
  width: 178px;
  height: 177px;
  display: block;
  -webkit-animation-name: bounce;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-timing-function: ease-in;
  -webkit-animation-direction: alternate;
  -webkit-animation-duration: .5s;
}
.tutarrow .arrow.right {
  background: url(../images/hud/hand-right.png) no-repeat;
}
.tutscreen.step_8 .tutarrow .arrow {
  -webkit-animation: follow 3s infinite;
}
@-webkit-keyframes follow {
  to {
    -webkit-transform: translate3d(96px, 240px, 0);
  }
}
.tutscreen {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: none;
  pointer-events: none;
  z-index: 80001;
  -webkit-user-select: none;
}
.tutscreen * {
  pointer-events: auto;
}
.tutorial-text {
  position: absolute;
  top: 100px;
  left: 50%;
  margin-left: -230px;
  font: bold 32px/42px GrilledCheeseBTNCn, sans-serif;
  color: #543001;
  width: 400px;
  padding: 10px 30px;
  border: 4px solid #fff;
  border-radius: 12px;
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 2px #d59d26 inset;
  background: url('../images/popup/pergament.png') center;
  background-size: cover;
}
.tutorial-char {
  position: absolute;
  background: url('../images/hud/parrot-right.png') left top no-repeat;
  right: 0px;
  top: 30px;
  width: 141px;
  height: 300px;
  pointer-events: none;
}
@-webkit-keyframes bouncer {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(20%, 0, 0);
  }
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  #game, body, html {
    min-height: 833px !important;
  }
  .tutarrow {
    width: 178px;
    height: 177px;
  }
  .tutarrow .arrow {
    background-image: url('../images/hud/hand.png');
  }
  .tutarrow .arrow.right {
    background-image: url('../images/hud/hand-right.png');
  }
}
#enforce-modal, #uiblocker {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  opacity: 1;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-transition: opacity .6s;
  background: rgba(0, 0, 0, 0.8);
  z-index: 8000;
}
.overlay {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  opacity: 1;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  -webkit-transition: opacity .6s;
  display: block!important;
  background: rgba(0, 0, 0, 0.2);
  z-index: 5001;
}
#enforce-modal.hidden, #uiblocker.hidden {
  display: none;
}
#uiblocker {
  z-index: 10020;
}
#enforce-urlBarRemove {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0);
  -webkit-transition: opacity .6s;
  display: block;
  z-index: 100000;
  opacity: 1;
  pointer-events: auto;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(359deg);
  }
}
.feedbacker, .feedbacker img {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto !important;
  -webkit-animation-duration: 0.75s;
  -webkit-animation-timing-function: ease;
}
.feedbacker.done {
  -webkit-transition: all 2s ease-in, opacity 1.6s 0.4s ease-in;
}
.feedbacker.to_food {
  -webkit-animation-name: foodOuterAnimation;
}
.feedbacker.to_food img {
  -webkit-animation-name: foodInnerAnimation;
}
.feedbacker.to_level {
  -webkit-animation-name: levelOuterAnimation;
}
.feedbacker.to_level img {
  -webkit-animation-name: levelInnerAnimation;
}
.feedbacker.to_coins {
  -webkit-animation-name: coinsOuterAnimation;
}
.feedbacker.to_coins img {
  -webkit-animation-name: coinsInnerAnimation;
}
.feedbacker.to_lock {
  -webkit-animation-name: lockOuterAnimation;
  z-index: 6000;
}
.feedbacker.to_lock img {
  -webkit-animation-name: lockInnerAnimation;
}
[data-in-tutorial="true"] .ship.actionIcon {
  visibility: hidden;
}
.popup {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -180px 0 0 -180px;
  width: 360px;
  height: 360px;
  z-index: 8001;
  font-family: GrilledCheeseBTNCn, sans-serif;
}
.popup h1 {
  margin: 0;
  padding: 0;
  color: #fff;
  font-size: 25px;
  font-family: GrilledCheeseBTNCn, sans-serif;
}
.popup h2 {
  margin: 0;
  padding: 0;
  color: #fff;
  font-size: 13px;
  font-family: GrilledCheeseBTNCn, sans-serif;
}
.xgoals button.cancel,
.popup button.cancel {
  position: absolute;
  right: 37px;
  top: 36px;
  width: 46px;
  height: 46px;
  border: none;
  background: url("../images/popup/close_button.png") no-repeat 0 0;
  background-size: auto 100%;
}
.xgoals button.cancel:active,
.popup button.cancel:active {
  background-position: -46px 0;
}
#level-up {
  background: url(../images/popup/levelup.png) no-repeat center;
  border: none;
  -webkit-border-image: none;
}
#level-up .header {
  background: none;
}
#level-up .header h1 {
  background: none;
  color: red;
  width: 100%;
  margin-top: 28px;
  text-align: center;
  font: 48px/108px GrilledCheeseBTN, sans-serif;
  font-weight: normal;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5), 0 -2px 0 rgba(255, 255, 255, 0.3);
}
#level-up h2 {
  background: none;
}
#level-up .unlocked {
  position: absolute;
  background: none;
  color: #6e1700;
  top: 373px;
  margin-left: 267px;
  height: 50px;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5), 0 -2px 0 rgba(255, 255, 255, 0.3);
}
#level-up .unlocked figure {
  height: 120px;
  width: 120px;
  margin-top: 0px;
  display: inline-block;
  background-size: 120px;
  background-repeat: no-repeat;
}
#level-up .rewards {
  position: absolute;
  color: red;
  margin-left: 0px;
  width: 100%;
  bottom: 115px;
  font: 42px/90px GrilledCheeseBTNCn, sans-serif;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5), 0 -2px 0 rgba(255, 255, 255, 0.3);
}
#level-up .rewards figure {
  height: 100px;
  width: 64px;
  background-size: 150px;
  background-repeat: no-repeat;
  background-position: 50%;
}
#level-up .checkout {
  bottom: 20px;
}
#level-up .rewards .gold {
  background-image: url(../images/status/coins.png);
  padding-bottom: 50px;
  height: 70px;
  width: 65px;
  display: inline-block;
}
#level-up .rewards .food {
  background-image: url(../images/popup/food.png);
  height: 43px;
  width: 60px;
  display: inline-block;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  #level-up figure.gold {
    background: url(../images/status/coins-small.png) no-repeat center;
  }
  #level-up .unlocked figure {
    margin-top: 60px;
  }
  .popup {
    margin: -420px 0 0 -360px;
    width: 720px;
    height: 720px;
  }
  .popup h1 {
    font-size: 50px;
  }
  .popup h2 {
    font-size: 26px;
  }
  .xgoals button.cancel,
  .popup button.cancel {
    right: 27px;
    top: 72px;
    width: 92px;
    height: 92px;
  }
  .xgoals button.cancel:active,
  .popup button.cancel:active {
    background-position: 100% 0;
  }
  .popup button.share {
    left: 186px;
    top: 624px;
    width: 124px!important;
    height: 90px!important;
    font-size: 46px;
  }
  .popup button.share:active {
    text-shadow: 0 0 20px yellow, 0 0 20px yellow;
  }
  /* Level Up */
  #level-up figure {
    height: 24px;
    padding-top: 90px;
    width: 128px;
    font-size: 22px;
    line-height: 40px;
    margin-top: -20px;
  }
}
.ipad #level-up .wrap {
  width: 500px;
  left: 50%;
  top: 50%;
  position: absolute;
  margin: -460px 0 0 -250px;
  height: 920px;
}
.ipad #level-up .header h1 {
  margin-top: 5px;
}
.ipad #level-up .unlocked {
  top: 371px;
  margin-left: 255px;
  height: 60px;
  font: 30px/70px GrilledCheeseBTNCn, sans-serif;
}
.ipad #level-up .unlocked figure {
  margin-top: 50px;
}
.ipad #level-up .rewards {
  bottom: 105px;
}
#level-up-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
/* Welcome Comic */
.comic {
  display: none;
  padding-top: 25px;
  border-width: none;
  -webkit-border-image: none;
  z-index: 100000;
  text-align: center;
}
.comic .wrap {
  display: inline-block;
  position: relative;
  min-width: 309px;
}
.comic .frame {
  height: 98px;
  width: 144px;
  position: absolute;
  border: 2px solid #f8bb55;
  -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  background-image: url(../images/comic/blue-panels.jpg);
}
.comic .frame p {
  margin: 4px 7px;
  font: normal 16px/16px GrilledCheeseBTNCn, sans-serif;
  text-shadow: 0 0 2px #1166a7, 0 0 2px #1166a7, 0 0 2px #1166a7, 0 0 2px #1166a7, 0 0 2px #1166a7;
}
.comic .no1,
.comic .no4 {
  width: 305px;
  height: 93px;
}
.comic .no1 {
  background-position: 0 0;
  margin: 5px 0 0 5px;
}
.comic .no2 {
  background-position: 0 -285px;
  margin: 95px 0 0 5px;
  z-index: 3;
}
.comic .no2 p {
  margin-top: 60px;
  text-shadow: 0 0 2px #a84b00, 0 0 2px #a84b00, 0 0 2px #a84b00, 0 0 2px #a84b00, 0 0 2px #a84b00;
}
.comic .no3 {
  background-position: 0 -187px;
  margin: 103px 0 0 166px;
  z-index: 3;
}
.comic .no4 {
  background-position: 0 -93px;
  margin: 198px 0 0 5px;
}
.comic .no5 {
  background-position: -144px -187px;
  margin: 285px 0 0 5px;
}
.comic .no6 {
  background-position: -144px -285px;
  margin: 285px 0 0 166px;
}
.comic .no6 .logo {
  margin-top: 4px;
  background: url(../images/logo.png) no-repeat center;
  height: 78px;
  position: absolute;
  width: 100%;
  background-size: contain;
}
.comic .no6 button {
  margin: 80px 0 0 30px;
  position: absolute;
}
.landscape .comic {
  padding-top: 75px;
}
.landscape .comic .no1 {
  margin: 5px 0 0 5px;
}
.landscape .comic .no2 {
  margin: 5px 0 0 320px;
}
.landscape .comic .no3 {
  margin: 110px 0 0 10px;
  z-index: 3;
}
.landscape .comic .no4 {
  margin: 97px 0 0 164px;
  width: 151px;
  background-position: -115px -93px;
}
.landscape .comic .no5 {
  margin: 112px 0 0 325px;
  z-index: 3;
  height: 83px;
}
.landscape .comic .no6 {
  margin: 204px 0 0 5px;
  width: 462px;
  height: 50px;
  z-index: 0;
  background-size: 200% 400px;
  background-position: bottom right;
}
.landscape .comic .no6 .logo {
  margin-top: -20px;
  height: 80px;
}
.landscape .comic .no6 button {
  margin: 5px 0 0 360px;
  position: absolute;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  .comic .wrap {
    min-width: 640px;
  }
  .comic .frame {
    height: 196px;
    width: 288px;
    border: 4px solid #f8bb55;
    -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    background-image: url(../images/comic/blue-panels.jpg);
  }
  .comic .frame p {
    margin: 8px 14px;
    font: normal 30px/32px GrilledCheeseBTNCn, sans-serif;
    text-shadow: 0 0 4px #1166a7, 0 0 4px #1166a7, 0 0 4px #1166a7, 0 0 4px #1166a7, 0 0 4px #1166a7;
  }
  .comic .no1,
  .comic .no4 {
    width: 610px;
    height: 187px;
  }
  .comic .no1 {
    margin: -15px 0 0 10px;
  }
  .comic .no2 {
    background-position: 0 -570px;
    margin: 175px 0 0 25px;
    z-index: 3;
  }
  .comic .no2 p {
    margin-top: 120px;
    text-shadow: 0 0 4px #a84b00, 0 0 4px #a84b00, 0 0 4px #a84b00, 0 0 4px #a84b00, 0 0 4px #a84b00;
  }
  .comic .no3 {
    background-position: 0 -374px;
    margin: 205px 0 0 317px;
  }
  .comic .no4 {
    background-position: -300px -187px;
    margin: 400px 0 0 25px;
    width: 290px;
    z-index: 3;
  }
  .comic .no5 {
    background-position: -288px -374px;
    margin: 430px 0 0 317px;
    height: 187px;
    z-index: 3;
  }
  .comic .no6 {
    background-position: bottom;
    margin: 620px 0 0 10px;
    width: 610px;
    height: 187px;
    z-index: 3;
  }
  .comic .no6 .logo {
    margin-top: 13px;
    height: 165px;
  }
  .comic .no6 button {
    margin: 205px 0 0 215px;
  }
  .browser {
    /* horrible mobile browser adjustment */
  
  }
  .browser .comic .frame {
    top: -20px;
  }
  .browser .comic .no6 {
    top: -80px;
  }
  .browser .comic .no6 button {
    top: -50px;
    right: 20px;
    margin-left: 0;
  }
  .landscape .comic .no1 {
    margin: 10px 0 0 10px;
  }
  .landscape .comic .no2 {
    margin: 10px 0 0 640px;
  }
  .landscape .comic .no3 {
    margin: 219px 0 0 20px;
  }
  .landscape .comic .no4 {
    margin: 195px 0 0 328px;
    width: 302px;
    background-position: -230px -187px;
  }
  .landscape .comic .no5 {
    margin: 225px 0 0 650px;
    height: 166px;
  }
  .landscape .comic .no6 {
    margin: 408px 0 0 10px;
    width: 925px;
    height: 100px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    background-size: 200% 400px;
  }
  .landscape .comic .no6 .logo {
    margin-top: -40px;
    height: 160px;
  }
  .landscape .comic .no6 button {
    margin: 10px 0 0 740px;
  }
}
.ipad {
  /* fixes for tutorial screen on ipad */

}
.ipad .comic {
  padding: 50px 0 0 64px;
}
.ipad .comic .wrap {
  min-width: 681px;
}
.ipad .comic .frame {
  height: 196px;
  width: 288px;
  border: 4px solid #f8bb55;
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  background-image: url(../images/comic/blue-panels.jpg);
}
.ipad .comic .frame p {
  margin: 8px 14px;
  font: normal 30px/32px GrilledCheeseBTNCn, sans-serif;
  text-shadow: 0 0 4px #1166a7, 0 0 4px #1166a7, 0 0 4px #1166a7, 0 0 4px #1166a7, 0 0 4px #1166a7;
}
.ipad .comic .no1,
.ipad .comic .no4 {
  width: 610px;
  height: 187px;
}
.ipad .comic .no1 {
  margin: -15px 0 0 10px;
}
.ipad .comic .no2 {
  background-position: 0 -570px;
  margin: 190px 0 0 25px;
  z-index: 3;
}
.ipad .comic .no2 p {
  margin-top: 120px;
  text-shadow: 0 0 4px #a84b00, 0 0 4px #a84b00, 0 0 4px #a84b00, 0 0 4px #a84b00, 0 0 4px #a84b00;
}
.ipad .comic .no3 {
  background-position: 0 -374px;
  margin: 220px 0 0 317px;
}
.ipad .comic .no4 {
  background-position: -300px -187px;
  margin: 415px 0 0 25px;
  width: 288px;
  z-index: 3;
}
.ipad .comic .no5 {
  background-position: -288px -374px;
  margin: 445px 0 0 317px;
  height: 187px;
  z-index: 3;
}
.ipad .comic .no6 {
  background-position: bottom;
  margin: 650px 0 0 10px;
  width: 610px;
  height: 187px;
  z-index: 3;
}
.ipad .comic .no6 .logo {
  margin-top: 13px;
  height: 165px;
}
.ipad .comic .no6 button {
  margin: 210px 0 0 230px;
  font-size: 36px;
  line-height: 32px;
  padding: 9px 30px 9px 30px;
}
.ipad.landscape .comic {
  padding: 70px 0 0 32px;
}
.ipad.landscape .comic .no1 {
  margin: 10px 0 0 10px;
}
.ipad.landscape .comic .no2 {
  margin: 10px 0 0 640px;
}
.ipad.landscape .comic .no3 {
  margin: 219px 0 0 20px;
}
.ipad.landscape .comic .no4 {
  margin: 195px 0 0 328px;
  width: 302px;
  background-position: -230px -187px;
}
.ipad.landscape .comic .no5 {
  margin: 225px 0 0 650px;
  height: 166px;
}
.ipad.landscape .comic .no6 {
  margin: 408px 0 0 10px;
  width: 925px;
  height: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  background-size: 200% 400px;
  background-position: bottom right;
}
.ipad.landscape .comic .no6 .logo {
  margin-top: -40px;
  height: 160px;
}
.ipad.landscape .comic .no6 button {
  margin: 25px 0 0 760px;
}
.ipad .step_7 .tutarrow .arrow {
  background: url(../images/hud/hand-right.png) top left no-repeat;
}
.intro {
  display: none;
  overflow: hidden;
  z-index: 200000;
  position: relative;
  height: 100%;
  width: 100%;
  color: #543001;
  background: rgba(0, 0, 0, 0.85);
  /* starting game already. intro should still be ontop of everything */

}
.intro .parrot {
  background: url('../images/hud/parrot.png') center top no-repeat;
  /*width: 424px;*/

  width: 100%;
  height: 538px;
  margin-top: 75px;
}
.intro .parrot:before {
  position: absolute;
  top: 180px;
  left: 50%;
  margin-left: -200px;
  display: block;
  content: "Squaak!";
  font: normal 52px/32px GrilledCheeseBTNCn, sans-serif;
  color: #fff;
  text-shadow: 0 0 5px #000, 2px 2px 4px #000;
}
.intro .intro-text {
  position: relative;
  margin: -190px auto 0;
  font: normal 30px/32px GrilledCheeseBTNCn, sans-serif;
  width: 401px;
  padding: 10px 30px;
  border: 4px solid #fff;
  border-radius: 12px;
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 2px #d59d26 inset;
  background: url('../images/popup/pergament.png') center;
  background-size: cover;
}
.intro .intro-text p {
  padding: .5em 0 .5em 0;
}
.intro .button {
  position: absolute;
  left: 50%;
  margin-top: 30px;
  margin-left: -3em;
}
.connect {
  padding: 20px;
  text-align: center;
}
.connect img {
  max-width: 90%;
}
.connect .embossed {
  margin-top: 10px;
}
.connect .button {
  margin-top: -8px;
}
.connect .button.play {
  width: 200px;
  font-size: 18px;
  line-height: 25px;
}
.connect .button.facebook {
  font-family: GrilledCheeseBTNCn;
  border-color: #2a447e!important;
  background-color: #617aac!important;
}
.ipad .connect {
  width: 400px;
  margin: 0 auto;
  padding-top: 100px;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  .connect {
    padding: 40px;
  }
  .connect .embossed {
    margin-top: 20px;
  }
  .connect .button {
    margin-top: -15px;
  }
  .connect .button.play {
    width: 400px;
    font-size: 36px;
    line-height: 50px;
  }
  .ipad .comic .wrap {
    margin-top: 100px;
  }
  .ipad .intro .parrot {
    margin-top: 175px;
  }
  .ipad #level-up .unlocked {
    margin-left: 195px!important;
    margin-top: -20px;
  }
}
#castle-complete {
  z-index: 5001;
}
.browser.ipad .comic .frame {
  top: -20px;
}
.browser.ipad .comic .no6 {
  top: -40px;
}
.browser.ipad .comic .no6 button {
  top: -40px;
}
#shop {
  position: absolute;
  top: 0px;
  right: 0;
  bottom: 0px;
  left: 0;
  background: url("../images/popup/wood-rough.png") top center;
  -webkit-border-image: url("../images/popup/bar.png") 16 0 16 0 repeat;
  border-top-width: 16px;
  border-right-width: 0px;
  border-bottom-width: 16px;
  border-left-width: 0px;
  color: #fff;
  z-index: 6000;
  display: block;
  opacity: 0;
  -webkit-transform: scale(0, 0);
  -webkit-transform-origin: 80% 100%;
  -webkit-transition: opacity 0.4s, -webkit-transform 0.4s;
}
#shop.active {
  opacity: 1;
  -webkit-transform: scale(1, 1);
}
#shop div.head {
  position: relative;
  background: url("../images/popup/shop_ribbon-nodiamonds.png") no-repeat;
  width: 456px;
  height: 76px;
  margin: 14px auto 10px;
  left: -46px;
  /* to compensate for cancel button */

}
#shop div.head h1 {
  position: absolute;
  text-align: center;
  text-transform: capitalize;
  width: 260px;
  right: 10px;
  font: 40px/76px GrilledCheeseBTN, sans-serif;
}
#shop div.head div.diamonds {
  display: none;
}
#shop div.head button.cancel {
  position: absolute;
  left: 100%;
  top: -4px;
  width: 92px;
  height: 92px;
  background: url("../images/popup/close_button.png") no-repeat 0 0;
  -webkit-appearance: none;
  margin: 0;
  border: 0;
  padding: 0;
}
#shop div.head button.cancel:active {
  background-position: -92px 0;
}
#shop div.departments_list_wrapper {
  padding: 0 30px;
}
#shop ul.departments_list {
  height: 64px;
  -webkit-box-shadow: 0 2px 3px #764d21, 0 2px 7px #ffffbe inset;
  height: 32px;
  display: table;
  width: 100%;
  -webkit-background-clip: padding-box;
  border: 4px solid #804817;
  border-radius: 14px;
  background: url("../images/popup/wood-rough.png") center -700px;
}
#shop ul.departments_list li {
  font: bold 36px/50px GrilledCheeseBTNCn, sans-serif, sans-serif;
  text-transform: capitalize;
  display: table-cell;
}
#shop ul.departments_list li a {
  color: #2f0101;
  font-family: GrilledCheeseBTNCn, sans-serif;
  font-weight: bold;
  text-shadow: 0 1px 1px #ffffbe;
  text-decoration: none;
  border-right: 2px solid #411d05;
  border-left: 2px solid #a9793a;
  display: block;
  height: 100%;
  text-align: center;
  line-height: 64px;
}
#shop ul.departments_list li a.active {
  color: #ffe400;
  pointer-events: auto;
  opacity: 1;
}
#shop ul.departments_list li a:active {
  background-color: rgba(49, 25, 0, 0.5);
}
#shop ul.departments_list li:first-child a {
  border-left: none;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
#shop ul.departments_list li:last-child a {
  border-right: none;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
#shop .departments {
  position: absolute;
  top: 192px;
  bottom: 0px;
  left: 30px;
  right: 30px;
  overflow: hidden;
  background: transparent;
  -webkit-tap-higlight: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
#shop hr {
  border: none;
  border-radius: 4px;
  padding: 0;
  margin: 0;
  left: 0;
  right: 0;
  position: absolute;
  z-index: 32000;
  height: 16px;
  background: url("../images/popup/bar.png") repeat-x;
  -webkit-background-size: 100%;
}
#shop .department {
  display: none;
  -webkit-tap-higlight: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
}
#shop .department.active {
  display: block;
}
#shop .department.population-maxed {
  display: none;
}
#shop .department li {
  height: 220px;
  margin-left: 0px;
  margin-right: 0px!important;
  -webkit-transform: translate3d(0, 0, 0);
}
#shop .department li .image {
  float: left;
  width: 144px;
  height: 100%;
  display: -webkit-box;
  -webkit-box-pack: center;
  -webkit-box-align: center;
}
#shop .department li .image img {
  height: 120px;
  display: block;
}
#shop .department li .specification {
  height: 132px;
  margin: 10px 10px 10px 160px;
}
#shop .department li .specification h6 {
  margin: 0;
  padding: 0;
  font: normal 36px/56px GrilledCheeseBTN, sans-serif;
  display: block;
  letter-spacing: 0;
  text-align: center;
}
#shop .department li .house .population {
  position: absolute;
  font: normal 28px/30px GrilledCheeseBTN, sans-serif;
  width: 140px;
  margin: 155px 0 0 -160px;
  text-align: center;
}
#shop .department li .house .population i {
  background: url(../images/status/population.png) no-repeat right;
  background-size: contain;
  width: 30px;
  height: 40px;
  display: inline-block;
  vertical-align: middle;
}
#shop .department li.population-maxed .population {
  color: red;
}
#shop .department li.unaffordable,
#shop .department li.population-maxed,
#shop .department li.unalevelable {
  background: #f4c555;
}
#shop .department li.unaffordable .embossed,
#shop .department li.population-maxed .button,
#shop .department li.population-maxed .embossed,
#shop .department li.unalevelable .button,
#shop .department li.unalevelable .embossed {
  display: none;
}
#shop .department li.unaffordable .button {
  background-color: brown;
  border-color: brown;
  margin-top: 80px;
}
#shop .department li.unaffordable:before,
#shop .department li.population-maxed:before,
#shop .department li.unalevelable:before {
  font: normal 48px/220px GrilledCheeseBTN, sans-serif;
  text-align: center;
  color: #a7610c;
  position: absolute;
  width: 100%;
  text-indent: 120px;
}
#shop .department li.unaffordable:before {
  content: "Can not afford!";
  /*"*/

}
#shop .department li.unalevelable:before,
#shop .department li.population-maxed:before {
  content: attr(title);
}
#shop .department .goldCost {
  margin: 20px 10px 0 0;
  padding-top: 12px;
}
#shop .department .contract + .goldCost {
  margin: -24px 30px 0 20px;
}
#shop .department .contract {
  margin-right: 5px;
}
#shop .department .contract span {
  display: inline-block;
  background-repeat: no-repeat;
  line-height: 60px;
  font-size: 36px;
}
#shop .department .contract .hint {
  font-size: 32px;
  opacity: .8;
}
#shop .department .contract .Food {
  background-image: url(../images/popup/food.png);
  padding-left: 66px;
}
#shop .department .contract .Time {
  text-align: center;
  background: url(../images/popup/arrow.png);
  width: 88px;
  margin: 0 10px;
  font: normal 28px/48px GrilledCheeseBTNCn, sans-serif;
}
#shop .department .contract .Gold {
  background-image: url(../images/status/coins-small.png);
  background-position: 0 center;
  padding-left: 40px;
}
#shop .department .contract .Area {
  background-image: url(../images/popup/boost.png);
  padding-left: 66px;
}
#shop #upgrade-castle {
  color: #422806;
  text-align: center;
  display: none;
  left: 32px;
  right: 32px;
}
#shop #upgrade-castle h6 {
  margin: 100px 0;
  font: normal 50px/44px GrilledCheeseBTN, sans-serif;
  text-shadow: 0 2px 0px #ffdc87;
}
#shop #upgrade-castle small {
  display: block;
  font-size: 30px;
}
#shop.locked ul.departments_list li a {
  pointer-events: none;
  opacity: 0.5;
}
/* iPad Version */
.ipad #shop {
  -webkit-transform: scale(1, 1) translatey(400px);
  top: auto;
  display: none;
  -webkit-border-image: url("../images/popup/metal-border.jpg") 50 0 50 0 stretch;
  border-top-width: 40px;
  height: 320px;
}
.ipad #shop.active {
  display: block;
  -webkit-transform: scale(1, 1) translatey(0);
}
.ipad #shop div.head {
  position: absolute;
  margin: -40px 0 0 50px;
  width: 90%;
  background: none;
  text-align: left;
}
.ipad #shop div.head div.gold {
  background: url(../images/popup/ribbon.png) no-repeat;
  width: 200px;
  height: 63px;
  text-align: center;
  font-size: 16px;
  line-height: 58px;
  margin: -15px 0 0 20px;
  text-indent: -50px;
}
.ipad #shop div.head h1 {
  position: static;
  width: 209px;
  height: 48px;
  margin-top: -20px;
  padding: 0;
  line-height: 40px;
  text-align: center;
  background-image: url(../images/popup/h2.png);
  font-size: 20px;
}
.ipad #shop div.head button.cancel {
  position: absolute;
  left: none;
  right: 50px!important;
  margin: -20px 0 0 -30px;
}
.ipad #shop hr {
  display: none;
}
.ipad #shop div.departments_list_wrapper {
  padding: 0;
}
.ipad #shop ul.departments_list {
  width: auto!important;
  margin: -50px 0 0 265px !important;
  border-width: 1px;
  position: absolute;
}
.ipad #shop ul.departments_list li {
  font-size: 18px;
  text-shadow: 0 1px 0 #fff;
}
.ipad #shop ul.departments_list li a {
  padding: 5px 30px 5px 30px;
  line-height: 48px;
  border-left-width: 1px;
  border-right-width: 1px;
}
.ipad #shop ul.departments_list li:first-child a {
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}
.ipad #shop ul.departments_list li:last-child a {
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}
.ipad #shop .departments {
  left: 0;
  right: 0;
  top: 40px;
  overflow: hidden;
}
.ipad #shop .departments .department {
  display: none;
  padding: 0 20px;
  position: absolute;
  width: auto;
  border-spacing: 3px;
}
.ipad #shop .departments .department.active {
  display: table;
}
.ipad #shop .departments .department.population-maxed {
  display: none;
}
.ipad #shop .departments .department li {
  display: table-cell;
  min-width: 220px;
  max-width: 220px;
  height: 250px;
  background-size: 100% 100%;
}
.ipad #shop .departments .department li.unaffordable:before,
.ipad #shop .departments .department li.population-maxed:before,
.ipad #shop .departments .department li.unalevelable:before {
  font: normal 16px/16px GrilledCheeseBTN, sans-serif;
  text-indent: 0;
  margin-top: 200px;
}
.ipad #shop .departments .department li .image {
  float: none;
  text-align: center;
  width: 100%;
  height: 90px;
  position: absolute;
  margin-top: 50px;
}
.ipad #shop .departments .department li .image img {
  margin: 0 auto;
  max-height: 70px;
  height: auto;
}
.ipad #shop .departments .department li .population {
  font: normal 14px/15px GrilledCheeseBTN, sans-serif;
  width: 190px;
  margin: 120px 0 0 0;
}
.ipad #shop .departments .department li .population i {
  width: 25px;
  height: 25px;
}
.ipad #shop .departments .department li div.specification {
  margin: 5px 10px;
}
.ipad #shop .departments .department li div.specification h6 {
  margin: 0px 0 90px;
  font-size: 25px;
  line-height: 22px;
  height: 50px;
  vertical-align: middle;
  line-height: 21px;
  display: -webkit-box;
  -webkit-box-pack: center;
  -webkit-box-align: center;
}
.ipad #shop .departments .department li div.specification .embossed {
  padding: 10px 0 15px;
}
.ipad #shop .departments .department li .button {
  padding: 7px 0;
  margin-top: -10px;
}
.ipad #shop .departments .department li .contract span {
  line-height: 30px;
  font-size: 18px;
}
.ipad #shop .departments .department li .contract .hint {
  font-size: 16px;
}
.ipad #shop .departments .department li .contract .Food {
  background-image: url(../images/popup/food.png);
  padding-left: 33px;
}
.ipad #shop .departments .department li .contract .Time {
  background: url(../images/popup/arrow.png);
  width: 44px;
  margin: 0 5px;
  font: normal 14px/24px GrilledCheeseBTNCn, sans-serif;
}
.ipad #shop .departments .department li .contract .Gold {
  background-image: url(../images/status/coins-small.png);
  background-size: contain;
  padding-left: 30px;
}
.ipad #shop .departments .department li .contract .Area {
  background-image: url(../images/popup/boost.png);
  padding-left: 33px;
}
.ipad #shop #upgrade-castle h6 {
  margin: 40px 0 50px;
}
/* Blocker Screen */
.landscape:before {
  content: "Please flip your Device";
  background: rgba(0, 0, 0, 0.6);
  position: absolute;
  z-index: 30000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: #fff;
  text-align: center;
  font: normal 30px/260px GrilledCheeseBTN, sans-serif;
  text-shadow: 0 3px 10px #000;
}
.landscape.ipad:before {
  display: none;
}
/* Message used for Intro, Goal Story */
.screens {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.message {
  background: url(../images/popup/scroll.png) no-repeat center;
  min-height: 346px;
  text-align: center;
  margin-top: 30px;
}
.message p {
  margin: 0 auto;
  padding: 60px 40px 30px 0;
  width: 200px;
  min-height: 200px;
  font: normal 28px/36px GrilledCheeseBTNCn, sans-serif;
  color: #6e1700;
}
.message p:first-letter {
  color: red;
}
.message button {
  margin-right: 40px;
  margin-bottom: 40px;
}
/* Pages, used for Shop/Level-Up/Castle Upgrade */
.page {
  position: absolute;
  z-index: 10000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: url("../images/popup/wood-rough.png") top center;
  -webkit-border-image: url("../images/popup/bar.png") 8 0 8 0 repeat;
  border-top-width: 8px;
  border-right-width: 0px;
  border-bottom-width: 8px;
  border-left-width: 0px;
  color: #fff;
}
.page .head {
  background: url("../images/popup/h1.png") no-repeat;
  width: 261px;
  height: 54px;
  margin: 7px auto 5px;
  position: relative;
  left: -23px;
  /* to compensate for cancel button */

}
.page .head h1 {
  width: 221px;
  margin-right: 15px;
  position: absolute;
  right: 5px;
  font: 24px/54px GrilledCheeseBTN, sans-serif;
  text-align: center;
  text-transform: capitalize;
}
.page .head button.cancel {
  position: absolute;
  left: 100%;
  top: -2px;
  -webkit-appearance: none;
  margin: 0;
  border: 0;
  padding: 0;
  width: 46px;
  height: 46px;
  background: url("../images/popup/close_button.png") no-repeat 0 0;
  background-size: auto 100%;
}
.page .head button.cancel:active {
  background-position: -46px 0;
}
.page .level {
  width: 125px;
  height: 256px;
  position: absolute;
  font: normal 50px/117px GrilledCheeseBTN, sans-serif;
  text-align: center;
  text-shadow: 0 0 10px #fff;
  color: #39a3ef;
  text-indent: 10px;
  margin: -20px 0 0 6px;
}
.page .description {
  font: normal 16px/17px GrilledCheeseBTNCn, sans-serif;
  margin: 0 16px;
}
.page h2 {
  width: 157px;
  height: 36px;
  font: normal 18px/36px GrilledCheeseBTN, sans-serif;
  background: url("../images/popup/h2.png") no-repeat;
  margin: 0 auto -10px;
  padding: 0;
  text-align: center;
}
#level-up .embossed, .rewards .embossed {
  z-index: -1;
  position: relative;
}
.page .rewards, .page .unlocked {
  margin: 0 16px 10px;
  text-align: center;
}
#level-up .rewards, #level-up .unlocked {
  margin-left: 135px;
}
.page .rewards .embossed, .page .unlocked .embossed {
  height: 44px;
}
.page .embossed.share {
  margin: 0px 16px 0 16px!important;
  top: 7px;
  height: 50px;
  z-index: 10000;
}
.page .checkout {
  position: absolute;
  bottom: 0;
  left: 50px;
  right: 50px;
  /* IMPORTANT: Fix for doubletap-bug */

  text-align: center;
  padding: 6px 16px;
}
/* Buttons */
.button,
button.invite,
button.askFriends,
button.ok {
  background: #82a207 url(../images/popup/button_texture.png) repeat-x center;
  border-radius: 6px;
  border: 1px solid #77910f;
  font: bold 18px/16px GrilledCheeseBTN, sans-serif;
  color: #fff;
  text-align: center;
  -webkit-box-shadow: 0 2px 5px rgba(255, 255, 255, 0.6) inset, 0 2px 2px rgba(0, 0, 0, 0.6);
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.6);
  padding: 6px 15px 3px 15px;
}
.button, button.askFriends, button.ok {
  padding: 12px 25px 10px 25px;
}
.button:active,
button.invite:active,
button.askFriends:active,
button.ok:active {
  -webkit-box-shadow: 0 0px 5px rgba(255, 255, 255, 0.6) inset, 0 1px 1px rgba(0, 0, 0, 0.3);
  text-shadow: 0 0 10px #ff0;
}
.button.invite,
button.invite,
.button.askFriends,
button.askFriends {
  background-color: #31A5DD;
  border-color: #096DA2;
}
.button.deny, button.deny {
  background-color: #ffa300;
  border-color: #af7000;
  padding: 6px 5px 3px 5px;
}
/* Panels, used for Shop Items */
.panel {
  display: block;
  -webkit-background-clip: padding-box;
  color: #543001;
  border-radius: 9px;
  border: 1px solid #B46A2E;
  margin: 2px 16px 0;
  background: #fdf7e1 url(../images/popup/pergament.png) center;
}
.embossed {
  font-family: GrilledCheeseBTNCn, sans-serif;
  font-size: 16px;
  border: 1px solid orange;
  border-radius: 6px;
  -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.3) inset;
  padding: 9px 5px 12px 5px;
  text-align: center;
  background: #fffffe;
  color: #6e1700;
}
#requests .panel .image {
  width: 50px;
  height: 50px;
  margin: 8px;
  border: 2px solid #85511e;
  border-radius: 6px;
  float: left;
  margin-right: 10px;
  background: #76cffa url(../images/popup/unknown.png) no-repeat center;
  background-size: 100%;
  position: relative;
  overflow: hidden;
}
#requests .panel .image + .specification {
  padding: 8px 10px 10px 70px;
  text-align: center;
}
#requests .panel .specification button {
  margin: -25px 2px 2px;
}
p.tiny {
  font: normal 15px/13px GrilledCheeseBTNCn;
  color: #98634b;
  margin-bottom: 5px;
}
p.tiny strong {
  color: #6e1700;
}
@media all and (-webkit-min-device-pixel-ratio: 2) {
  .landscape:before {
    font: normal 60px/520px GrilledCheeseBTN, sans-serif;
  }
  .message {
    background: url(../images/popup/scroll.png) no-repeat center;
    min-height: 692px;
    margin-top: 60px;
  }
  .message p {
    padding: 120px 80px 60px 0;
    width: 400px;
    min-height: 400px;
    font: normal 56px/72px GrilledCheeseBTNCn, sans-serif;
  }
  .message p:first-letter {
    color: red;
  }
  .message button {
    margin-right: 80px;
    margin-bottom: 80px;
  }
  .button,
  button.invite,
  button.askFriends,
  button.ok {
    background-image: url(../images/popup/button_texture.png);
    border-radius: 12px;
    border-width: 2px;
    font: bold 36px/32px GrilledCheeseBTN, sans-serif;
    -webkit-box-shadow: 0 4px 10px rgba(255, 255, 255, 0.6) inset, 0 4px 4px rgba(0, 0, 0, 0.6);
    text-shadow: 0 -2px 2px rgba(0, 0, 0, 0.6);
    padding: 12px 30px 6px 30px;
  }
  .button, button.askFriends, button.ok {
    padding: 24px 45px 15px 45px;
  }
  .button:active,
  button.invite:active,
  button.askFriends:active,
  button.ok:active {
    -webkit-box-shadow: 0 0px 5px rgba(255, 255, 255, 0.6) inset, 0 1px 1px rgba(0, 0, 0, 0.3);
    text-shadow: 0 0 20px #ff0;
  }
  .button.deny, button.deny {
    padding: 12px 10px 6px 10px;
  }
  .panel {
    margin: 4px 32px 0;
    border-radius: 18px;
    background: #fdf7e1 url(../images/popup/pergament.png) center;
    border: 2px solid #B46A2E;
  }
  .embossed {
    border-width: 2px;
    border-radius: 12px;
    -webkit-box-shadow: 0 0 8px rgba(0, 0, 0, 0.3) inset;
    padding: 18px 10px 24px 10px;
    font-size: 32px;
  }
  /* Pages, used for Shop/Level-Up/Castle Upgrade */
  .page {
    -webkit-border-image: url("../images/popup/bar.png") 16 0 16 0 repeat;
    border-top-width: 16px;
    border-right-width: 0px;
    border-bottom-width: 16px;
    border-left-width: 0px;
  }
  .page .head {
    background: url("../images/popup/h1.png") no-repeat;
    width: 522px;
    height: 108px;
    margin: 14px auto 10px;
    left: -46px;
    /* to compensate for cancel button */
  
  }
  .page .head h1 {
    width: 442px;
    margin-right: 30px;
    right: 10px;
    font: 48px/108px GrilledCheeseBTN, sans-serif;
  }
  .page .head button.cancel {
    left: 100%;
    top: -4px;
    width: 92px;
    height: 92px;
    background: url("../images/popup/close_button.png") no-repeat 0 0;
  }
  .page .head button.cancel:active {
    background-position: -92px 0;
  }
  .page .level {
    width: 250px;
    height: 512px;
    font: normal 100px/234px GrilledCheeseBTN, sans-serif;
    text-shadow: 0 0 20px #fff;
    text-indent: 20px;
    margin: -40px 0 0 12px;
  }
  .page .description {
    font: normal 32px/34px GrilledCheeseBTNCn, sans-serif;
    margin: 0 20px;
  }
  .page h2 {
    width: 314px;
    height: 72px;
    font: normal 36px/72px GrilledCheeseBTN, sans-serif;
    background: url("../images/popup/h2.png") no-repeat;
    margin: 0 auto -20px;
  }
  .page .rewards, .page .unlocked {
    margin: 0 32px 20px;
  }
  #level-up .rewards, #level-up .unlocked {
    margin-left: 270px;
  }
  .page .rewards .embossed, .page .unlocked .embossed {
    height: 88px;
  }
  .page .embossed.share {
    margin: 0px 32px 0 32px!important;
    top: 14px;
    height: 100px;
    font-size: 32px;
  }
  .page .checkout {
    padding: 12px 32px;
  }
  #requests .panel .image {
    width: 100px;
    height: 100px;
    margin: 16px;
    border-width: 4px;
    border-radius: 12px;
    margin-right: 20px;
    background-image: url(../images/popup/unknown.png);
  }
  #requests .panel .image img {
    width: 100px;
    height: 100px;
  }
  #requests .panel .image + .specification {
    padding: 16px 20px 20px 140px;
  }
  #requests .panel .specification button {
    margin: -50px 4px 4px;
  }
  p.tiny {
    font: normal 30px/25px GrilledCheeseBTNCn;
    margin-bottom: 10px;
  }
}
#shop div.head div.gold, #castle-complete div.head div.gold {
  position: absolute;
  top: 18px;
  left: 25px;
  padding: 0 0 5px 40px;
  font: bold 28px/38px sans-serif;
  text-shadow: 0 1px 1px #000;
  background: url(../images/status/coins-small.png) no-repeat 0 center;
}
#shop .goldCost i, #castle-complete .purchaseItem i {
  display: inline-block;
  width: 36px;
  height: 38px;
  margin: 0 6px 0 0;
  vertical-align: middle;
  background: url(../images/status/coins-small.png) no-repeat 0 center;
}
figure.unlockable-dom-node {
  position: absolute;
  margin: 0;
  pointer-events: none;
  opacity: 1;
  -webkit-transition: opacity .5s;
}
figure.unlockable-dom-node.unlocked {
  -webkit-animation-name: fadeout-unlockable;
  -webkit-animation-duration: 0.4s;
  -webkit-animation-fill-mode: forwards;
}
figure.unlockable-dom-node header {
  font-family: GrilledCheeseBTN, sans-serif;
  text-align: left;
  color: #813b26;
  position: absolute;
  background: url(../images/entities/unlock/sign.png) top left no-repeat;
  box-sizing: border-box;
  left: 50%;
  top: 50%;
  margin-left: -277px;
  margin-top: -120px;
  width: 554px;
  height: 201px;
  padding: 60px 0 0 120px;
}
figure.unlockable-dom-node h1 {
  font-family: GrilledCheeseBTN, sans-serif;
  font-size: 34px;
  line-height: 52px;
  font-weight: normal;
}
figure.unlockable-dom-node h1:before {
  content: attr(data-zone-number);
  font-size: 72px;
  line-height: 110px;
  height: 110px;
  width: 110px;
  position: absolute;
  left: 6px;
  text-align: center;
}
figure.unlockable-dom-node header div {
  font-size: 28px;
  margin: 0;
  width: auto;
  height: auto;
  display: block;
}
figure.unlockable-dom-node[data-zone-number="2"] header, figure.unlockable-dom-node[data-zone-number="5"] header {
  margin-top: -60px;
}
.notification {
  pointer-events: none;
  position: absolute;
  z-index: 6001;
  top: 120px;
  right: 10px;
  background: url(../images/popup/parrot-notif.png) no-repeat center;
  background-size: 470px 220px;
  font: normal 28px/28px GrilledCheeseBTNCn;
  padding: 80px 55px 0 140px;
  width: 280px;
  height: 130px;
  visibility: hidden;
}
.notification.ready {
  -webkit-transition: -webkit-transform 0.6s 0.3s ease-out;
}
.notification.read {
  -webkit-transition-delay: 3.5s;
}
.popup.grab-attention .cancel,
.grab-attention #castle-complete .cancel,
#shop.grab-attention .cancel,
.goals.grab-attention .cancel {
  -webkit-animation-name: pulse;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-duration: .2s;
  -webkit-animation-direction: alternate;
  -webkit-animation-timing-function: ease;
  -webkit-transition: -webkit-transform 0.4s ease-out;
}
