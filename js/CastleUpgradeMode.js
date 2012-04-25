/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";

    var wc = wooga.castle,
        utils = wooga.castle.utils,
        l10n = wooga.castle.l10n,
        disabler = function () {return false;},

    CastleUpgradeMode = function (manager, config) {
        this.manager = manager;
        this.parentNode = config.rootNode;
        this.build();
    },
    _screenInstance = null,
    CastleCompleteScreen,
    InvitationHandler;

    CastleUpgradeMode.prototype.build = function(){

        var hud = document.createElement('div'),
            infoPanel = document.createElement("div");
            var closeButton = document.createElement("button");
        utils.addClass(hud, 'hud_mode castle_upgrade');
        infoPanel.className = "infoPanel";
        infoPanel.innerHTML = '<p class="specification"></p><div class="menu"></div>';
        hud.appendChild(infoPanel);
        this.rootNode = hud;
        this.infoPanel = infoPanel;
        document.getElementById("game_overlay").appendChild(hud);

        var clickHandler = utils.bind(function (ev) {
            ev.preventDefault();
            if(utils.hasClass(ev.target, 'disabled')) {
                return;
            }
            var action = ev.target.getAttribute('data-actionname');
            if (this.handle) {
                this.handle(action, this);
            }

        }, this);

        var actions = {
            "cancel": true,
            "confirm": true
            };
        var action;

        for (action in actions) {
            if (actions.hasOwnProperty(action)) {
                var a = document.createElement("a");
                a.className = action;
                a.setAttribute('href', '#');
                a.innerHTML = action;
                a.setAttribute('data-actionname', action);
                utils.addClass(a, 'action ' + action);

                a.addEventListener('click', clickHandler, false);

                this.infoPanel.querySelector('.menu').appendChild(a);
            }
        }


        this.game = wooga.castle.Game.instance();
    };


    CastleUpgradeMode.prototype.handle = function (actionMessage, actionsMenu) {
        if("confirm" === actionMessage) {
            if( wooga.castle.Game.instance().drain('gold', this.target.entity.definition.upgradeCost, this.target) ) {
                this.confirm();
            }
        } else if("cancel" === actionMessage) {
            this.cancel();
        }
    };

    CastleUpgradeMode.prototype.activate = function (config) {
        var target = config.target,
            upgradeCost,
            upgradeInfo,
            upgradeLevel,
            hasRequiredLevel = true;

        this.target = target;

        if(! utils.can('upgrade-castle', target)) {
            return;
        }

        this.manager.view.isFocusedEntityView = function (entityView) {
            return entityView === target;
        };

        if (target.entity.definition.unlockCondition === "level") {
            upgradeLevel = target.entity.definition.unlockValue;
            if (wooga.castle.playerData.level < upgradeLevel) {
                upgradeInfo = this.infoPanel.querySelector('.specification p');
                upgradeInfo.innerHTML = "Upgrading requires level <strong>" + upgradeLevel + "</strong>.";
                this.infoPanel.querySelector('.specification .gold').innerHTML = this.game.playerData.gold;
                hasRequiredLevel = false;
            }
        }

       if (hasRequiredLevel === true) {
            upgradeCost = target.entity.definition.upgradeCost;
            upgradeInfo = this.infoPanel.querySelector('p.specification');
            upgradeInfo.innerHTML = "Upgrade your castle for <strong>" + upgradeCost + "</strong> coins.";
//            this.infoPanel.querySelector('.specification .gold').innerHTML = this.game.playerData.gold;
        }


        target.makeDynamic();

        utils.can('touch-entity', disabler);
        utils.can('entity/contract/change', disabler);


        this.show();
        utils.publish('view:entity/ensureVisible', target);

    };

    CastleUpgradeMode.prototype.confirm = function () {

        wooga.castle.playerData.upgradingCastle = true;
        this.target.setUnderConstruction(true);
        var d = new CastleCompleteScreen(this.target);
        this.deactivate();
    };
    CastleUpgradeMode.prototype.cancel = function () {
        this.deactivate();
    };

    CastleUpgradeMode.getEntityName = function (entity) {
        return (entity || wooga.castle.game.castle).key.indexOf('campsite') !== -1 ? 'Campsite' : 'Castle';
    };

    CastleUpgradeMode.prototype.deactivate = function () {
        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;
        this.target.makeStatic();
        if( this.target.actionsMenu ) {
            this.target.actionsMenu.destructor();
        }
        this.target = null;
        this.hide();
        utils.can.remove('touch-entity', disabler);
        utils.can.remove('entity/contract/change', disabler);
        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
    };

    CastleUpgradeMode.prototype.position = function () {
        var style = this.rootNode.style,
            entity = this.target,
            top = entity.y + (entity.height* 0.8),
            left = entity.x + entity.width * 0.5,
            gridUnit = entity.view.gridUnit;

        if(left < entity.view.gridUnit*5) {
            left = entity.view.gridUnit*5; // TODO: make this value configurable
        }

        if(left > 1430) {
            left = 1490-(entity.view.gridUnit*5); // TODO: make this better
        }
        style.webkitTransform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    };


    CastleUpgradeMode.prototype.show = function () {
        this.position();
        utils.addClass(this.rootNode, "active");

    };

    CastleUpgradeMode.prototype.hide = function () {
        utils.removeClass(this.rootNode, "active");
    };

    CastleCompleteScreen = function (castle, initiallyHidden) {
        _screenInstance = this;
        this.castle = castle;
        this.initiallyHidden = initiallyHidden;
        this.game = wooga.castle.Game.instance();
        this.build();
    };

    CastleCompleteScreen.instance = function () {
        return _screenInstance;
    };

    CastleCompleteScreen.prototype.build = function () {

        var self = this,
            target = this.castle;

        wooga.castle.net.getTemplate(utils.urlFor('templates/castle-complete.html')).addCallback(function (response) {
            var node = document.createElement('div'),
                accepted = InvitationHandler.acceptedCount();

            node.innerHTML = response.data;
            self.node = node;

            var peopleNeeded = Math.max(target.entity.definition.friendsToUpgrade - accepted, 0);

            self.populateScreen(peopleNeeded, target.entity.definition.friendsToUpgrade).wireIn();

            if(self.initiallyHidden) {
                self.hide();
            } else {
                self.show();
            }

            utils.enableScrollability(self.ul);
            node.querySelector("hr").style.display = "block";

            document.querySelector('#mlm-content').appendChild(node);


        }, this);

    };

    CastleCompleteScreen.prototype.populateScreen = function (peopleNeeded, total) {

        var li, ul, alreadyInvited;

        li = this.node.querySelector('.items li.hidden');
        ul = li.parentNode;
        this.li = li;
        this.ul = ul;

        ul.innerHTML = '';
        ul.appendChild(li);

        alreadyInvited = InvitationHandler.get();

        var limitAccepted = 0;

        Object.keys(alreadyInvited).map(function(type){
            Object.keys(alreadyInvited[type]).map(function(key){
                if(limitAccepted++ >= total){
                    return false;
                }
                this.addInvitee(alreadyInvited[type][key], type);
            }, this);
        }, this);

        if( peopleNeeded ){
            var peopleArray = this.castle.entity.definition.partyInvites,
            i = 0;
            peopleArray.forEach(function(_person){
                if(i >= peopleNeeded || InvitationHandler.invited('game', wooga.castle.game.entitiesDefinition[_person].name)){
                    return;
                }
                ++i;
                this.addInvitee(utils.extend({key: wooga.castle.game.entitiesDefinition[_person].name}, wooga.castle.game.entitiesDefinition[_person]), "game");
            }, this);

        }

        return this;

    };

    CastleCompleteScreen.prototype.addInvitee = function(person, type){

        var _li = this.li.cloneNode(true),
            button = _li.querySelector('button'),
            invited = InvitationHandler.invited(type, person.key);
        _li.querySelector('h6').innerHTML = person.name || person.key;

        //_li.querySelector('specialistImg').innerHTML = person.;
        var specialistPic = _li.querySelector('.specialistImg img');
        if (person.specialistImg) {
            specialistPic.src = utils.urlForEntityImage(person.specialistImg);
            specialistPic.style.visibility = 'visible';
        } else {
            specialistPic.style.visibility = 'hidden';
        }

        if(invited) {
            var coster = _li.querySelector('.cost'),
                inviteButton = _li.querySelector('.invite');
            if(coster){
                coster.parentNode.removeChild(coster);
            }
            if(inviteButton){
                inviteButton.parentNode.removeChild(inviteButton);
            }
            utils.removeClass(_li.querySelector('.invited')||{}, 'hidden');
        } else {
            if(person.cost) {
                button.setAttribute('data-cost', person.cost);
                _li.querySelector('.cost').innerHTML = "Hire for <i></i>"+person.cost;
                utils.toggleClass(_li, 'unaffordable', !wooga.castle.game.hasStat('gold', person.cost));
            }
            _li.querySelector('.invite').setAttribute('data-person', JSON.stringify(person));
        }
        if(person.picture){
            var pic =  _li.querySelector('.image img');
            pic.src = person.picture;
            pic.style.visibility = 'visible';
        }
        utils.removeClass(_li, 'hidden');
        this.ul.appendChild(_li);
    };

    CastleCompleteScreen.prototype.wireIn = function () {
        var self = this,
            node = this.node,
            touch = wooga.castle.capabilities.touch,
            hideMeFN = function (ev) {
                ev.preventDefault();
                self.hide();
                if("true" === node.getAttribute('data-can-advance')) {
                    if(wooga.castle.playerData.castleUpgradeTokens){
                        wooga.castle.playerData.castleUpgradeTokens.forEach(function(token){
                            wooga.castle.tokens.remove(token);
                        });
                    }
                    if(wooga.castle.playerData.castleUpgradeToken){
                        wooga.castle.tokens.remove(wooga.castle.playerData.castleUpgradeToken);
                    }
                    wooga.castle.playerData.castleUpgradeTokens = null;
                    wooga.castle.playerData.castleUpgradeToken = null;
                    delete wooga.castle.playerData.castleUpgradeTokens;
                    delete wooga.castle.playerData.castleUpgradeToken;
                    self.castle.upgrade();
                    wooga.castle.game.publish('player/update');
                }
            },
            itemClickFN = function (ev) {
                var button = utils.parents(ev.target, 'button');
                if(! button){
                    return;
                }

                if(utils.hasClass(button, 'preventGostCklickOnNotify')){
                    return;
                }
                utils.addClass(button, 'preventGostCklickOnNotify');
                setTimeout(function(){
                    utils.removeClass(button, 'preventGostCklickOnNotify');
                }, 2000);

                ev.preventDefault();
                if( utils.hasClass(button, 'invite') ) {
                    try{
                    self.handleGameInvite(JSON.parse(button.getAttribute('data-person')), button);
                    } catch(e) {}
                }
            };

        node.querySelector('.cancel').addEventListener(touch? 'touchend' : 'click', hideMeFN, false);
        node.querySelector('.ok').addEventListener(touch? 'touchend' : 'click', hideMeFN, false);

        node.querySelector('.askFriends').addEventListener(touch? 'touchend' : 'click', function (ev) {
            if(!wooga.castle.playerData.castleUpgradeToken){
                wooga.castle.playerData.castleUpgradeToken = wooga.castle.tokens.generate();
            }
            wooga.castle.game.publish('player/update');
        }, false);

        node.querySelector('.requiredItems').addEventListener( touch? 'touchend' : 'click',  itemClickFN, false);

    };

    CastleCompleteScreen.prototype.handleGameInvite = function (person, el) {
        if(! this.game.drain('gold', person.cost)) {
            wooga.notify(utils.goldDeltaMessage(person.cost, 'hire this specialist.'), 'gold');
            return;
        }

        var parent = el.parentNode,
            coster = parent.querySelector('.cost'),
            invitedNode = parent.querySelector('.invited');

        coster.parentNode.removeChild(coster);
        parent.removeChild(el);

        utils.removeClass(invitedNode, 'hidden');

        wooga.castle.publish('invited/from-game', {
            "person": person
        });

        this.beforeShow();
    };

    CastleCompleteScreen.prototype.hide = function () {
        this.node.style.display = 'none';
        setTimeout(utils.bind(function () {
            utils.can.remove('show-overlay', disabler);
            utils.publish('view:castle-upgrade/hide', {screen: this});
            this.afterHide();
        }, this), 48);
    };

    CastleCompleteScreen.prototype.show = function () {
        utils.can('show-overlay', disabler);
        this.beforeShow();
        this.node.style.display = 'block';
        utils.publish('view:castle-upgrade/show', {screen: this});
    };

    CastleCompleteScreen.prototype.beforeShow = function () {
        var node = this.node,
            accepted = InvitationHandler.acceptedCount(),
            friendsCount = this.castle.entity.definition.friendsToUpgrade,
            canAdvance = friendsCount <= accepted;

        this.setProfessionalInfo(node.querySelector('#castleInfo'), friendsCount);

        if( canAdvance ) {
            node.querySelector('.askFriends').style.display = "none";
            node.querySelector('.ok').style.display = "inline-block";
        } else {
            node.querySelector('.askFriends').style.display = "none";

            Array.prototype.forEach.call(node.querySelectorAll('.invite'), function(el) {
                var rawData = el.getAttribute('data-person');
                if (rawData){
                    try{
                        var person = JSON.parse(rawData);
                        if (person){
                            utils.toggleClass(utils.parents(el, 'li'), 'unaffordable', !wooga.castle.game.hasStat('gold', person.cost));
                        }
                    } catch (e) {}
                }
            });
        }

        node.setAttribute('data-can-advance', canAdvance ? 'true' : 'false');
        node.querySelector('.value.gold').innerHTML = this.game.getStat('gold');
    };


    CastleCompleteScreen.prototype.setProfessionalInfo = function (node, friendsCount) {
        var infoStr = '<p>You need some help to complete the Castle:<br>Hire {NUMBER} {PROS} to help you!</p>';

        infoStr = infoStr.replace("{NUMBER}", friendsCount);
        infoStr = infoStr.replace("{PROS}", friendsCount > 1 ? "Professionals" : "Professional");
        node.innerHTML = infoStr;
    };


    CastleCompleteScreen.prototype.afterHide = function () {
        this.game.worldView.publish('castleUpgradeScreen/close');
    };

    CastleCompleteScreen.prototype.invalidate = function(){
        this.populateScreen(Math.max(0, this.castle.entity.definition.friendsToUpgrade - InvitationHandler.acceptedCount()), this.castle.entity.definition.friendsToUpgrade);
    };

    CastleCompleteScreen.prototype.destructor = function () {

        this.node.parentNode.removeChild(this.node);
        delete this.node;
        _screenInstance = null;

        InvitationHandler.reset();

    };

    wooga.castle.subscribe('game/ready', function (message) {
        if(message.game.playerData.upgradingCastle) {
            var ccs = new CastleCompleteScreen(message.game.castle.entityView, true);
        }
    });

    InvitationHandler = Object.create(null);

    utils.oprop(InvitationHandler, '_game', {});
    utils.oprop(InvitationHandler, 'add', function (type, person) {
        this[("_" + type).toLowerCase()][person.key] = person;
        this._save();
        return this;
    });
    utils.oprop(InvitationHandler, 'addFromGame', function (person) {
        return this.add('game', person);
    });

    utils.oprop(InvitationHandler, '_save', function () {
        wooga.castle.playerData.invitations = {
            "game": this._game
        };
        return this;
    });

    utils.oprop(InvitationHandler, '_load', function () {
        var stored = wooga.castle.playerData.invitations;
        if( stored ) {
            this._game = stored.game||this._game;
        }
        return this;
    });

    utils.oprop(InvitationHandler, 'reset', function () {
        this._game = {};
        this._save();
        return this;
    });

    utils.oprop(InvitationHandler, 'invited', function (type, key) {
        type = String(type).toLowerCase();
        return this['_' + type][key];
    });

    utils.oprop(InvitationHandler, 'get', function (type) {
        var all = {
            "game": utils.extend({}, this._game)
        };
        return type ? all[type] : all;
    });

    utils.oprop(InvitationHandler, 'inviteesCount', function (type) {

        if(! type){
            return this._game.length;
        }

        return this[("_" + type).toLowerCase()].length;
    });

    utils.oprop(InvitationHandler, 'acceptedCount', function (type) {
        var fn = function (o) {
            return Object.keys(o).length;
        };
        if(! type){
            return fn(this._game);
        }
        return fn(this[("_" + type).toLowerCase()]);
    });

    wooga.castle.subscribe('invited/from-game', function (message) {
        InvitationHandler.addFromGame(message.person);
    });
    wooga.castle.subscribe('game/ready', function (message) {
        InvitationHandler._load();
    });


    wooga.castle.InvitationHandler = InvitationHandler;
    wooga.castle.CastleUpgradeMode = CastleUpgradeMode;
    wooga.castle.CastleCompleteScreen = CastleCompleteScreen;

}());
