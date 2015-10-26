/*var Tetra = (function(){
    var vars = {
        //Max number of cards
        max: 100,
        //Arrays to Hold persistant Objects
        collection: [],
        gameCards: [],
        names: [],
        area: [],
        playerStats: {
            "wins":0,
            "losses":0,
            "draws":0
        },
    },
    me = {
        init: init,
        _private:{vars:vars}
    };

    //Start Here
    function init(where){
        loadStyles('css/tetra.css');
        loadScript('http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',function(){
            loadScript('js/cardList.js',function () {
                buildGameArea(where);
            });
        });
    }
    //Loads Style in
    function loadStyles(url){
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(link, entry);
    }
    //Loads Extra Files
    function loadScript(url, callback){
        var script = document.createElement('script');
        script.async = true;
        script.src = url;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
        script.onload = script.onreadystatechange = function()
        {
            var rdyState = script.readyState;
            if (!rdyState || /complete|loaded/.test(script.readyState))
            {
                callback();
                script.onload = null;
                script.onreadystatechange = null;
            }
        };
    }
    //Loads Favicon
    function loadFavicon(){
        var icon = document.createElement('link');
        icon.rel = 'shortcut icon';
        icon.href = 'images/favicon.ico';
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(icon, entry);
    }

    return me;
})();
*/
var Tetra = {
    //Max number of cards
    max: 100,
    //Arrays to Hold persistant Objects
    collection: [],
    gameCards: [],
    names: [],
    area: [],
    playerStats: {
        "wins":0,
        "losses":0,
        "draws":0
    },

    //Object templates

    //Card Data
    Card: function(num){
        this.num = num?num:Tetra.getCardNumber();
        this.name = null;
        this.maxAtk = 0;
        this.type = null;
        this.maxPdef = 0;
        this.maxMdef = 0;
        this.icon = "z";
        Tetra.getCardMaxes(this);
        this.atk = Math.floor(Tetra.getValue(0,this.maxAtk));
        this.pdef = Math.floor(Tetra.getValue(0,this.maxPdef));
        this.mdef = Math.floor(Tetra.getValue(0,this.maxMdef));
        this.arrwNum = Math.floor(Tetra.getValue(0,9));
        this.arrws = [];
        this.batWon = 2000;
        this.batLvl = 10;
        this.value = Tetra.convertValue(this);
        Tetra.setArrows(this);
    },
    //Card Store
    CardStore: function(type){
        this.type = type;
        this.cards = [];
        this.shifted = 1;
    },

    //Play Area
    PlayArea: function(){
        this.area = [];
        var count = 15,
        blocks = Math.floor(Tetra.getValue(0,7));
        while(true){
            if(blocks > 0){
                var temp = Math.floor(Tetra.getValue(0,16));
                if(!this.area[temp]){
                    this.area[temp] = true;
                    blocks--;
                }
            }
            else{
                if(!this.area[count]){
                    this.area[count] = false;
                }
                count--;
            }
            if(count < 0){break;}
        }
    },

    //HTML or Visual Card
    HtmlCard: function(card,index){
        cardDiv = $('.card.template').clone();
        for (var arrow in card.arrws) {
            if (card.arrws.hasOwnProperty(arrow)){
                if(card.arrws[arrow]){
                    $(cardDiv).find('.'+arrow).addClass('arrow on');
                }
            }
        }
        $(cardDiv).attr('data-where', index).attr('data-local', 'hand').find('.name').text(card.name).parent().find('.value').text(card.value);
        return cardDiv;
    },

    //Html Challenger
    HtmlChallenger: function(){
        var j = 0,
            i = Math.floor(Tetra.getValue(0,19)),
            name = Tetra.challengers[i].name;
        for(j = 0;j < Tetra.names.length;j++){
            if(Tetra.names[j] === name){
                i = Math.floor(Tetra.getValue(0,19));
                name = Tetra.challengers[i].name;
                j = -1;
                continue;
            }
        }
        Tetra.names.push(name);
        this.name = name;
        this.img = new Image();
        this.img.src = Tetra.challengers[i].img;
        this.rating = '';
        for(j = 0;j < 5;j++){
            this.rating += (j <= Tetra.challengers[i].rating-1)?'<span class=power>&ofcir;</span>':'<span class=empty>&xodot;</span>';
        }
    },

    //Function Begin

    //Start Here
    init: function(where){
        this.loadStyles('css/tetra.css');
        this.loadScript('http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',function(){
            Tetra.loadScript('js/cardList.js',function () {
                Tetra.buildGameArea(where);
            });
        });
    },

    //Loads Style in
    loadStyles: function(url){
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(link, entry);
    },

    //Loads Extra Files
    loadScript: function(url, callback){
        var script = document.createElement('script');
        script.async = true;
        script.src = url;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
        script.onload = script.onreadystatechange = function()
        {
            var rdyState = script.readyState;
            if (!rdyState || /complete|loaded/.test(script.readyState))
            {
                callback();
                script.onload = null;
                script.onreadystatechange = null;
            }
        };
    },

    //Loads Favicon
    loadFavicon: function(){
        var icon = document.createElement('link');
        icon.rel = 'shortcut icon';
        icon.href = 'images/favicon.ico';
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(icon, entry);
    },

    //Parent Div
    buildGameArea: function(where){
        where = !where?'body':'.'+where;
        if(where === 'body'){
            this.loadFavicon();
        }
        var div = document.createElement('div');
        $(where)
            .append(
                $(div)
                    .addClass('game')
            );
        this.loadStartScreen();
    },

    //Start Screen\Main Menu
    loadStartScreen: function(){
        $('.game')
            .removeClass()
            .addClass('game main')
            .load('js/templates/mainMenu.html',function () {
                Tetra.setMenuClicks();
            });
    },

    //Menu Functionality
    setMenuClicks: function(){
        var buttons = $('.menuContainer UL').children();
        $(buttons[0]).click(function(event){
            Tetra.startNewGame();
        });
        $(buttons[1]).click(function(event){
            Tetra.continueGame();
        });
        $(buttons[2]).click(function(event){
            Tetra.loadOptionsMenu();
        });
    },

    //Main Menu Fucntions
    startNewGame: function(){
        this.createStartCards();
        this.loadChallengers();
    },

    continueGame: function(){
        this.loadPlayerCards();
        this.loadChallengers();
    },

    loadOptionsMenu: function(){
        alert('Options');
        var tempCards = [];
        if(localStorage.playerCards){
            delete localStorage.playerCards;
        }
        for(i = 0; i < 100;i++){
            tempCards.push(new this.Card(i+1));
        }
        for(i = 0;i < 100;i++){
            this.collection[i] = new this.CardStore(i+1);
        }
        for(i = 0;i < this.collection.length;i++){
            if(tempCards[i]){
                var type = tempCards[i].num;
                this.collection[type-1].cards.push(tempCards[i]);
            }
        }
        localStorage.playerCards = JSON.stringify(this.collection);
        this.loadChallengers();
    },

    //New Game Function
    createStartCards: function(){
        var tempCards = [];
        if(localStorage.playerCards){
            delete localStorage.playerCards;
        }
        for(i = 0; i < 5;i++){
            tempCards.push(new this.Card());
        }
        for(i = 0;i < 100;i++){
            this.collection[i] = new this.CardStore(i+1);
        }
        for(i = 0;i < this.collection.length;i++){
            if(tempCards[i]){
                var type = tempCards[i].num;
                this.collection[type-1].cards.push(tempCards[i]);
            }
        }
        localStorage.playerCards = JSON.stringify(this.collection);
    },

    //Continue Function
    loadPlayerCards: function(){
        localStorage.playerCards ? this.collection = JSON.parse(localStorage.playerCards) : this.startNewGame();
    },

    //Game Start Functions
    loadChallengers: function(){
        this.names = [];
        $('.game')
            .removeClass()
            .addClass('game challengers')
            .load('js/templates/challengerSelect.html', function () {
                for(i = 0;i < 10;i++){
                    li = document.createElement('li');
                    who = new Tetra.HtmlChallenger();
                    var temp = document.createElement('span');
                    $('.challengeList')
                        .append(
                            $(li)
                                .addClass('challenge '+who.name)
                                .append(who.img)
                                .append($(temp).html(who.name+'<br/>'+who.rating))
                    );
                }
                Tetra.setButtons();
                Tetra.setChallengers();
            });
    },

    setChallengers: function(event){
        $('.challenge').click(function(){
            var who = $(this).attr('class');
            who = who.split(' ');
            who = who.splice(1,who.length-1);
            who = who.join(' ');
            console.log(who);
            Tetra.loadCardSelectionScreen();
        });
    },

    loadCardSelectionScreen: function(callback){
        $('.game')
            .removeClass()
            .addClass('game cards')
            .load('js/templates/cardSelection.html', function () {
                for(var i = 0; i < 100; i++) {
                    if(Tetra.collection[i].cards.length > 0){
                        var type = Tetra.collection[i].cards[0].icon;
                        $('.'+i).addClass('full icon-'+type).children().removeClass().html(Tetra.collection[i].cards.length);
                        if(Tetra.collection[i].cards.length == 1){
                            $('.'+i).children().addClass("clear");
                        }
                    }
                }
                Tetra.fillPlayerInfo();
                Tetra.setButtons();
                Tetra.setSelectGrid();
                if (callback) {
                    callback();
                }
            });
            $.get('js/templates/card.html', function (card) {
                $('.game').append(card);
            },'html');
    },

    setSelectGrid: function(){
        $('.full').click(function(){
            Tetra.rendercardSelector(this);
        });
    },

    setSelector: function(where){
        var temp;
        $('.selector').unbind('click').click(function(){
            if($(this).hasClass('left')){
                temp = where.cards.shift();
                where.cards.push(temp);
                where.shifted++;
                if(where.shifted > where.cards.length){
                    where.shifted = 1;
                }
            }
            else{
                temp = where.cards.pop();
                where.cards.unshift(temp);
                where.shifted--;
                if(where.shifted < 1){
                    where.shifted = where.cards.length;
                }
            }
            Tetra.rendercardSelector(where);
        });
        $('.card.1').unbind('click').click(function(){
            $(this).unbind('click');
            if(Tetra.gameCards.length <= 4){
                switch(Tetra.gameCards.length){
                    case 0: $(this).css({left:'-454px',top:'325px'});break;
                    case 1: $(this).css({left:'-349px',top:'325px'});break;
                    case 2: $(this).css({left:'-244px',top:'325px'});break;
                    case 3: $(this).css({left:'-139px',top:'325px'});break;
                    case 4: $(this).css({left:'-34px',top:'325px'});break;
                }
                Tetra.gameCards.push(where.cards.shift());
                if(where.shifted > where.cards.length){
                    where.shifted = 1;
                }
                setTimeout(function(){Tetra.rendercardSelector(where);},250);
                if(Tetra.gameCards.length === 5){
                    temp = confirm('Ready to play?');
                    temp?Tetra.buildPlayArea():function(){return;};
                }
            }
            else{
                alert('Hand is Full!!');
                temp = confirm('Ready to play?');
                temp?Tetra.buildPlayArea():function(){return};
            }
        });
        $('.tempC').unbind('click').click(function(){
            temp = $(this).attr('class');
            temp = temp.split(' ');
            temp = temp[temp.length -1];
            temp = Tetra.gameCards.splice(temp,1);
            temp = temp[0];
            Tetra.collection[temp.num-1].cards.push(temp);
            $(this).css({top:'-150px',border:'1px solid rgba(0,0,0,0)',background:'transparent'});
            setTimeout(function(){Tetra.rendercardSelector(where);},150);
        });
    },

    buildPlayArea: function(){
        $('.game')
            .removeClass()
            .addClass('game Playing')
            .load('js/templates/playField.html','html');
            $.get('js/templates/card.html', function (card) {
                $('.game').append(card);
                Tetra.renderCards();
            },'html');
    },

    renderCards: function(){
        var i = 0,
            cards = this.gameCards;
        for(i = 0; i < 5;i++){
            cards.push(new this.Card());
        }
        for(i = 0; i < 10;i++){
            var temp;
            if(i < 5){
                temp = this.HtmlCard(this.gameCards[i],i);
                $(temp).removeClass('off template').addClass('hand faceUp blue top-'+(4-i)).attr('data-player',1);
                $($('.stack')[0]).append($(temp));
                this.isFaceUp(temp);
            }
            else{
                temp = this.HtmlCard(cards[i],i);
                $(temp).removeClass('off template').addClass('back top-'+(9-i)).attr('data-player',2);
                $($('.stack')[1]).append($(temp));
            }
        }
        this.setCards();
    },

    setCards: function(){
        $('.card').unbind('click').click(function(){
            var location = Tetra.getLocation(this);
            if(!$(this).hasClass('back')){
                if($('.selected').length===0||$(this).hasClass('selected')){
                    if($(this).hasClass('played')||$(this).hasClass('selected')){
                        $(this).removeClass('played selected r hand '+location).attr('data-local','hand')
                            .addClass('hand');
                    }
                    else{
                        $(this).addClass('selected')
                            .removeClass('hand');
                    }
                }
            }
            else{
                if($('.temp').length===0||$(this).hasClass('temp')){
                    if($(this).hasClass('played')||$(this).hasClass('temp')){
                        $(this).removeClass('faceUp red played temp l '+location).attr('data-local','hand');
                        Tetra.isFaceUp(this);
                    }
                    else{
                        $(this).addClass('temp');
                    }
                }
            }
        });
        this.renderGrid();
    },

    renderGrid: function(){
        this.area = new this.PlayArea();
        $('.field').find('td').each(function (i) {
            if (Tetra.area.area[i]) {
                $(this).addClass('block');
            }
        });
        this.setGrid();
        this.getScores();
        this.setButtons();
    },

    setGrid: function(){
        $('.field td').click(function(event){
            var card;
            if($('.selected')[0]){
                card = $('.selected');
            }
            else if($('.temp')[0]){
                card = $('.temp');
            }
            var location = Tetra.getLocation(this);
            if($(this).hasClass('block')){
                card.click();
            }
            else if(card.hasClass('temp')){
                card.removeClass('temp').addClass('played red faceUp l '+location).attr('data-local',location);
                Tetra.isFaceUp(card);
                Tetra.checkForAttack(card);
            }
            else{
                card.removeClass('selected').addClass('played r '+location).attr('data-local',location);
                Tetra.checkForAttack(card);
            }
        });
    },

    getLocation: function(grid){
        return $(grid).attr('data-local');
    },

    getScores: function(fights){
        var p1 = 0,
            p2 = 0,
            i = 0,
            cards = $('.stack').children();
        for(i = 0;i < cards.length;i++){
            if($(cards[i]).hasClass('blue')&&$(cards[i]).hasClass('played')){
                p1++;
            }
            else if($(cards[i]).hasClass('red')&&$(cards[i]).hasClass('played')){
                p2++;
            }
        }
        $('.p1').attr('data-score',p1).html(p1);
        $('.p2').attr('data-score',p2).html(p2);
        Tetra.checkForGameEnd(fights);
    },
    //Buttons
    setButtons: function(){
        $('.menu').click(function(event){
            Tetra.loadStartScreen();
        });
        $('.reload').click(function(event){
            var classes = $('.buttons').parent().attr('class');
            classes = classes.split(' ');
            switch(classes[1]){
                case 'challengers': Tetra.loadChallengers();break;
                case 'cards':       Tetra.loadCardSelectionScreen();break;
                case 'Playing':     Tetra.buildPlayArea();break;
                default:            Tetra.loadStartScreen();
            }
            //location.reload();
        });
    },

    //Random Util Functions To be Sorted But needed to get going right now
    fillPlayerInfo: function(){
        if(localStorage.playerStats){
            Tetra.playerStats = JSON.parse(localStorage.playerStats);
        }
        else{
            Tetra.playerStats.wins = 0;
            Tetra.playerStats.losses = 0;
            Tetra.playerStats.draws = 0;
        }
        for(var stat in Tetra.playerStats) {
           if (Tetra.playerStats.hasOwnProperty(stat)) {
               $('.'+stat).children().html(Tetra.playerStats[stat]+"&nbsp;");
           } 
        }
        $('.cCount').children().text(Tetra.countCards());
        $('.type').children().text(Tetra.countTypes());
    },

    countCards: function(){
        var count = 0,
            i = 0;
        for(i;i < 100;i++){
            count += this.collection[i].cards.length;
        }
        return count;
    },

    countTypes: function(){
        var count = 0,
            i = 0;
        for(i;i < 100;i++){
            if(this.collection[i].cards.length > 0){
                count++;
            }
        }
        return count;        
    },

    checkForGameEnd: function(fights){
        var p1 = parseInt($('.p1').attr('data-score'),10),
            p2 = parseInt($('.p2').attr('data-score'),10),
            temp,
            tempCards = [];
        fights = fights?fights:[];
        if((p1+p2) === 10 && fights.length === 0){
            setTimeout(function(){
                tempCards = Tetra.gameCards.splice(5,5);
                Tetra.clearBoard();
                if(p1>p2){
                    Tetra.playerStats.wins += 1;
                    $('.blue').each(function(){
                        if($(this).attr('data-where') > 4){
                            $(this).addClass('hand').click(function(){
                                temp = tempCards.slice($(this).attr('data-where')-5,$(this).attr('data-where')-4);
                                temp = temp[0];
                                Tetra.collection[temp.num-1].cards.push(temp);
                                $(this).unbind().css({left:'50px',border:'1px solid rgba(0,0,0,0)',background:'rgba(0,0,0,0)'});
                                var card = this;
                                setTimeout(function(){$(card).remove();},200);
                                Tetra.cleanUp();
                            });
                        }
                    });
                    if(p1 === 10){
                        setTimeout(function(){
                        for(var i = 5;i < 10;i++){
                            var card = $('.blue')[i];
                            $(card).trigger('click');
                        }
                        },400);
                    }
                }
                if(p1<p2){
                    Tetra.playerStats.losses += 1;
                    $('.red').each(function(){
                        if($(this).attr('data-where') < 4){
                            $(this).addClass('hand').click(function(){
                                temp = Tetra.gameCards.splice($(this).attr('data-where'),1);
                                temp = temp[0];
                                $(this).unbind().css({left:'-50px',border:'1px solid rgba(0,0,0,0)',background:'rgba(0,0,0,0)'});
                                var card = this;
                                setTimeout(function(){$(card).remove();},200);
                                Tetra.cleanUp();
                            });
                        }
                    });
                    if(p2 === 10){
                        setTimeout(function(){
                        for(var i = 0;i < 5;i++){
                            var card = $('.red')[i];
                            Tetra.gameCards.shift();
                            $(card).unbind().css({left:'-50px',border:'1px solid rgba(0,0,0,0)',background:'rgba(0,0,0,0)'});
                            setTimeout(function(){$(card).remove();},200);
                            Tetra.cleanUp();
                        }
                        },400);
                    }
                }
                if(p1 === p2){
                    Tetra.playerStats.draws += 1;
                }
            },1000);
        }
        else {
            return;
        }
    },

    cleanUp: function(){
        if(gameCards.length > 0){
            gameCards = gameCards.splice(0,5);
            while(true){
                collection[gameCards[0].num-1].cards.push(gameCards.shift());
                if(gameCards.length === 0){
                    break;
                }
            }
        }
        // alert('saved');
        // localStorage.playerStats = JSON.stringify(playerStats);
        // localStorage.playerCards = JSON.stringify(collection);
    },

    clearBoard: function(){
        $('.card').attr('data-local','hand').each(function(){
            temp = $(this).attr('class');
            temp = temp.split(' ');
            for(var i = 0;i < temp.length;i++){
                if(temp[i].match(/top-\d/)){
                    $(this).attr('data-local',temp[i]);
                }
            }
            temp = 'card ';
            temp += $(this).attr('data-local');
            temp = ($(this).attr('data-player') === '1')?temp + ' blue':temp + ' red';
            $(this).unbind('click').removeClass().addClass(temp);
        });
        temp = document.createElement('div');
        $('.fieldBox').empty().append($(temp).addClass('field').css('border','1px solid transparent'));
    },

    rendercardSelector: function(where){
        $('.hover').removeClass('hover');
        $(where).addClass('hover');
        if(where.cards){
            if(where.cards.length === 0){
                where.cards.push(0);
            }
        }
        if(where.className){
            where = ($(where).attr('class'))?$(where).attr('class'):0;
            where = where.split(' ');
            where = where[1];
            where = Tetra.collection[where];
        }
        $('.cardInfo').load('js/templates/cardInfo.html', function () {
            if(where.cards[0] !== 0){
                for(i = (where.cards.length <= 5)?where.cards.length-1:4;i > -1;i--){
                    temp = new Tetra.HtmlCard(where.cards[i]);
                    $('.select').append($(temp).removeClass('off template').addClass('faceUp blue '+(i+1)).css({'left':i*10+45+'px','top':'5px'}));
                    Tetra.isFaceUp(temp);
                }
            }
            else{
                 where.cards.pop();
                 $('.deleteButton').addClass('clear');
            }
            if(where.cards.length <= 1){
                $('.selector, .place').addClass('clear');
            }
            $('.max').text(where.cards.length);
            $('.cur').text(where.shifted);
            Tetra.setSelector(where);
        });
        $('.tempHand').empty();
        for(i = 0;i < Tetra.gameCards.length;i++){
            temp = new Tetra.HtmlCard(Tetra.gameCards[i]);
            $('.tempHand').append($(temp).removeClass('off template').addClass('faceUp blue tempC '+i).css('left',(50+(105*i))+'px'));
            Tetra.isFaceUp(temp);
        }
    },

    isFaceUp: function(card){
        if($(card).hasClass('faceUp')){
            $(card).children().each(function(){
                if($(this).hasClass('on')||$(this).hasClass('value')||$(this).hasClass('name')){
                    $(this).removeClass('off');
                }
            });
        }
        else{
            $(card).children().each(function(){
                $(this).addClass('off');
            });
        }
    },

    getValue: function(min,max){
        return Math.random() * (max-min) + min;
    },

    getCardNumber: function(){
        var weights = [0.5,0.2,0.1,0.05,0.03,0.03,0.03,0.02,0.02,0.02],
            values = [1,2,3,4,5,6,7,8,9,10],
            num1 = this.getWeigthed(values,weights),
            num2 = this.getWeigthed(values,weights);
        return num1*num2;
    },

    getWeigthed: function(list,weight){
        var total = weight.reduce(function(prev,cur,i,arr){
            return prev + cur;
        }),
            random = this.getValue(0,total),
            sum = 0,
            i = 0;
        for(i = 0; i < list.length;i++){
            sum += weight[i];
            sum = +sum.toFixed(2);
            if(random <= sum){
                return list[i];
            }
        }
    },

    getCardMaxes: function(card){
        var list = this.masterCardList[card.num-1];
        card.name = list[0];
        card.maxAtk = list[1];
        card.type = list[2];
        card.maxPdef = list[3];
        card.maxMdef = list[4];
        card.icon = list[5];
    },

    convertValue: function(card){
        var value = '',
            temp = card.atk;
        value += this.convertToHex(temp);
        value += card.type;
        temp = card.pdef;
        value += this.convertToHex(temp);
        temp = card.mdef;
        value += this.convertToHex(temp);
        return value;
    },

    convertToHex: function(num){
        if(num>=0&&num<=15){
            num = 0;
        }else if(num>=16&&num<=31){
            num = 1;
        }else if(num>=32&&num<=47){
            num = 2;
        }else if(num>=48&&num<=63){
            num = 3;
        }else if(num>=64&&num<=79){
            num = 4;
        }else if(num>=80&&num<=95){
            num = 5;
        }else if(num>=96&&num<=111){
            num = 6;
        }else if(num>=112&&num<=127){
            num = 7;
        }else if(num>=128&&num<=143){
            num = 8;
        }else if(num>=144&&num<=159){
            num = 9;
        }else if(num>=160&&num<=175){
            num = 'A';
        }else if(num>=176&&num<=191){
            num = 'B';
        }else if(num>=192&&num<=207){
            num = 'C';
        }else if(num>=208&&num<=223){
            num = 'D';
        }else if(num>=224&&num<=239){
            num = 'E';
        }else if(num>=240&&num<=255){
            num = 'F';
        }
        return num;
    },

    setArrows: function(card){
        var count = card.arrwNum,
            total = 7;
        while(true){
            if(count > 0){
                var temp = Math.floor(this.getValue(0,8));
                if(!card.arrws[temp]){
                    card.arrws[temp] = true;
                    count--;
                }
            }
            else{
                if(!card.arrws[total]){
                    card.arrws[total] = false;
                }
                total--;
            }
            if(total < 0){break;}
        }
    },

    getPrimes: function(max) {
        var sieve = [],
            i = 0,
            j = 0,
            primes = [];
        for (i = 2; i <= max; ++i) {
            if (!sieve[i]) {
                primes.push(i);
                for (j = i << 1; j <= max; j += i) {
                    sieve[j] = true;
                }
            }
        }
        return primes;
    },

    checkForAttack: function(card){
        var arrows = this.gameCards[$(card).attr('data-where')].arrws,
            where = $(card).attr('data-local'),
            check = this.getSurround(where),
            fights = [],
            captures = [],
            i = 0;
        for(i = 0;i < arrows.length;i++){
            if(arrows[i]){
                if(!this.isEmpty(check[i])){
                    if(this.isFight(check[i],where,$(card).attr('data-player'))){
                        fights[i] = i;
                    }
                    else if($('.'+check[i]).attr('data-player') !== $(card).attr('data-player')){
                        captures[i] = i;
                    }
                }
            }
        }
        if(fights.length > 0){
            var count = 0;
            for(i = 0;i < fights.length;i++){
                if(fights[i] !== undefined){
                    count++;
                }
            }
            if(count > 1){
                for(i = 0;i < fights.length;i++){
                    if(fights[i] !== undefined){
                        $('.'+check[i]).addClass('fight')
                        .unbind('click').click(function(event){
                            if($(this).hasClass('fight')){
                                $('.stack').children().each(function(){
                                    $(this).removeClass('fight');
                                });
                                Tetra.fight(this,card);
                            }
                        });
                    }
                }
            }
            else{
                for(i = 0;i < fights.length;i++){
                    if(fights[i] !== undefined){
                        this.fight($('.'+check[fights[i]]),card);
                    }
                }
            }
        }
        else if(fights.length === 0){
            for(i = 0;i < captures.length;i++){
                if(captures[i] !== undefined){
                    this.capture($('.'+check[i]),card);
                }
            }
        }
        setTimeout(function(){Tetra.getScores(fights);},1001);
    },

    isEmpty: function(location){
        var empty = true;
        if($('.'+location)[0]){
            empty = false;
        }
        return empty;
    },

    isFight: function(card,threat,owner){
        var me = $('.'+card),
            arrows = this.gameCards[me.attr('data-where')].arrws,
            check = this.getSurround(me.attr('data-local')),
            fight = false,
            i = 0;
        for(i = 0;i < arrows.length;i++){
            if(arrows[i]&&check[i] === threat&&me.attr('data-player') !== owner){
                fight = true;
            }
        }
        return fight;
    },

    fight: function(attacked,attacker){
        var attckr = this.gameCards[$(attacker).attr('data-where')],
            attckd = this.gameCards[$(attacked).attr('data-where')],
            i = 0,
            attack = 0,
            defense = 0,
            type = attckr.type;
        setTimeout(function(){
            switch(type){
                case 'P':
                case 'M':
                case 'X':   attack = attckr.atk; break;
                case 'A':   attack = Tetra.largest(attckr); break;
            }
            switch(type){
                case 'P':   defense = attckd.pdef; break;
                case 'M':   defense = attckd.mdef; break;
                case 'X':   defense = Tetra.smaller(attckd); break;
                case 'A':   defense = Tetra.smallest(attckd); break;
            }
            attack -= Math.floor(Tetra.getValue(0,attack+1));
            defense -= Math.floor(Tetra.getValue(0,defense+1));
            console.log('Attack: '+attack+'\nDefense: '+defense);
            if(attack > defense){
                Tetra.capture(attacked,attacker,0);
                Tetra.checkCombo(attacked);
                Tetra.checkForAttack(attacker);
            }
            else{
               Tetra.capture(attacker,attacked,0);
               Tetra.checkCombo(attacker);
            }
        },1000);
    },

    checkCombo: function(card,recheck){
        var arrows = this.gameCards[$(card).attr('data-where')].arrws,
            where = $(card).attr('data-local'),
            check = this.getSurround(where),
            i = 0;
        for(i = 0;i < arrows.length;i++){
            if(arrows[i]){
                if(!this.isEmpty(check[i])){
                    this.capture($('.'+check[i]),card);
                }
            }
        }
    },

    capture: function(loss,gain,time){
        loss = $(loss);
        gain = $(gain);
        loss.attr('data-player',gain.attr('data-player'));
        time = time === 0?time:1000;
        setTimeout(function(){
            if(gain.hasClass('blue')){
                loss.removeClass('red').addClass('blue');
            }
            else if(gain.hasClass('red')){
                loss.removeClass('blue').addClass('red');
            }
        },time);
    },

    getSurround: function(center){
        var i = 0,
            j = 0,
            row = center.charAt(0),
            col = center.charAt(1),
            blocks = $('.block');
            window.group = [];
         switch(row){
            case 'a':   group[i++] = false; group[i++] = false; group[i++] = row; group[i++] = 'b';
                        group[i++] = 'b'; group[i++] = 'b';group[i++] = row; group[i++] = false; break;
            case 'b':   group[i++] = 'a'; group[i++] = 'a'; group[i++] = row; group[i++] = 'c';
                        group[i++] = 'c'; group[i++] = 'c'; group[i++] = row; group[i++] = 'a'; break;
            case 'c':   group[i++] = 'b'; group[i++] = 'b'; group[i++] = row; group[i++] = 'd';
                        group[i++] = 'd'; group[i++] = 'd'; group[i++] = row; group[i++] = 'b'; break;
            case 'd':   group[i++] = 'c'; group[i++] = 'c'; group[i++] = row; group[i++] = false;
                        group[i++] = false; group[i++] = false; group[i++] = row; group[i++] = 'c'; break;
        }
        i = 0;
        switch(col){
            case '1':   group[i++] += col; group[i++] += '2'; group[i++] += '2'; group[i++] += '2';
                        group[i++] += col; group[i++] = false; group[i++] = false; group[i++] = false; break;
            case '2':   group[i++] += col; group[i++] += '3'; group[i++] += '3'; group[i++] += '3';
                        group[i++] += col; group[i++] += '1'; group[i++] += '1'; group[i++] += '1'; break;
            case '3':   group[i++] += col; group[i++] += '4'; group[i++] += '4'; group[i++] += '4';
                        group[i++] += col; group[i++] += '2'; group[i++] += '2'; group[i++] += '2'; break;
            case '4':   group[i++] += col; group[i++] = false; group[i++] = false; group[i++] = false;
                        group[i++] += col; group[i++] += '3'; group[i++] += '3'; group[i++] += '3'; break;
        }
        for(i = 0;i < group.length;i++){
            var patt = /false/;
            if(group[i]){
                if(group[i].match(patt)){
                    group[i] = false;
                }
            }
        }
        for(i = 0;i < blocks.length;i++){
            for(j = 0;j < group.length;j++){
                if($(blocks[i]).attr('data-local') === group[j]){
                    group[j] = false;
                }
            }
        }
        return group;
    },

    largest: function(card){
        var attack = card.atk;
        if(card.pdef > attack){
            attack = card.pdef;
        }
        if(card.mdef > attack){
            attack = card.mdef;
        }
        return attack;
    },

    smaller: function(card){
        var defense = card.pdef;
        if(card.mdef < defense){
            defense = card.mdef;
        }
        return defense;
    },

    smallest: function(card){
        var defense = card.atk;
        if(card.pdef < defense){
            defense = card.pdef;
        }
        if(card.mdef < defense){
            defense = card.mdef;
        }
        return defense;
    }
};