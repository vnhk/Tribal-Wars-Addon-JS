(function() {
    'use strict';
    const world = "pl138";
    const playerName = game_data.player.name;
    let playerId = "t="+game_data.player.id+"&";
    console.log(playerId);

    let accountType = 0; //sprawdzanie swojego konta //1 sprawdzanie na zascie

    function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    function operation(e) {
        if(e.key == "c"){

            if(window.location.href.indexOf(game_data.player.id)==-1){
                playerId="";
            }
            getPlayerStats();
            getPlayerArmy();
        }
    }
    const Stats = {};

    function getPlayerStats() {
    let statsUrl = 'https://'+world+'.plemiona.pl/game.php?'+playerId+'village=&screen=info_player&mode=awards';
        function getStat(element) {
            if(element==null){
               console.log("Odznaczenia sa niedostepne.");
                return;
            }
            let text = element.innerText;
            text = text.substring(0, text.indexOf("/") - 1);
            return text;
        }

            let htmlElem = document.createElement("html");
            htmlElem.innerHTML = httpGet(statsUrl);

            const attack = htmlElem.
            querySelector("#content_value > div:nth-child(4) > div:nth-child(1) > div.award-group-content > div:nth-child(1) > div.award-desc > div > span");
            const defence = htmlElem.
            querySelector("#content_value > div:nth-child(4) > div:nth-child(1) > div.award-group-content > div:nth-child(3) > div.award-desc > div > span");
            const resourcePlunder = htmlElem.
            querySelector("#content_value > div:nth-child(4) > div:nth-child(1) > div.award-group-content > div:nth-child(5) > div.award-desc > div > span");
            const villagePlunder = htmlElem.
            querySelector("#content_value > div:nth-child(4) > div:nth-child(1) > div.award-group-content > div:nth-child(7) > div.award-desc > div > span");
            const helper = htmlElem.
            querySelector("#content_value > div:nth-child(4) > div:nth-child(1) > div.award-group-content > div:nth-child(11) > div.award-desc > div > span");
            //
            Stats.killedUnitInAttack = getStat(attack);
            Stats.killedUnitInDefence = getStat(defence);
            Stats.plunderedResources = getStat(resourcePlunder);
            Stats.plunderedVillages = getStat(villagePlunder);
            Stats.killedUnitInHelp = getStat(helper);
            console.log(Stats);
    }

    function getPlayerArmy() {
        let amountOfDeffInAllVillages = 0; //wszystkie wspierane wioski przez wszystkie wioski gracza lacznie - ilosc deffa
        let amountOfDeffInThisVillage = 0; //wszystkie wspierane wioski tylko przez 1 wioske - ilosc deffa

        const units = new Array("Piki", "Miecze", "Topory", "Luki", "Zwiad", "LK", "LNK", "CK", "Tarany", "Katy", "Rycerz", "Szlachcic");

        function showArmy(x){
            let village = x.querySelectorAll("tr");
                for (let i = 1; i < village.length - 1; i++) {
                    if(village[i].getElementsByClassName("village_anchor")[0].innerText.indexOf(" ("+playerName+") (")!=-1){
                       continue;
                    }

                    console.log("Wioska : " + village[i].getElementsByClassName("village_anchor")[0].innerText+"jest wspierana przez:");
                    let army = village[i].getElementsByClassName("unit-item");
                    for (let z = 0; z < army.length; z++) {
                        if (army[z].innerText > 0) {
                            console.log(units[z] + ": " + army[z].innerText);
                            switch(z){
                                case 0:
                                case 1:
                                case 3: amountOfDeffInThisVillage+=parseInt(army[z].innerText);
                                    break;
                                case 4: amountOfDeffInThisVillage+=parseInt(army[z].innerText)*2;
                                    break;
                                case 7: amountOfDeffInThisVillage+=parseInt(army[z].innerText)*6;
                                    break;
                            }
                        }
                    }
                    console.log("-----");
                }
        }
        console.log("Wojska gracza:");

        function showAllUnitsInThisVillage(id){
            let urlBarracks = "https://"+world+".plemiona.pl/game.php?"+playerId+"village="+id+"&screen=barracks";
            let urlStable = "https://"+world+".plemiona.pl/game.php?"+playerId+"village="+id+"&screen=stable";
            let urlWorkshop = "https://"+world+".plemiona.pl/game.php?"+playerId+"village="+id+"&screen=garage";


            function showArmy(url){
            let htmlElem = document.createElement("html");
            htmlElem.innerHTML = httpGet(url);
            let barracksTable = htmlElem.querySelectorAll('#train_form > table > tbody > tr');

            for(let i =1;i<barracksTable.length-1;i++){
                console.log(barracksTable[i].getElementsByClassName("unit_link")[0].innerText + " : "
                            + barracksTable[i].querySelector("td:nth-child(3)").innerText);//nazwa i ilosc wojska
                 }
            }
            showArmy(urlBarracks);
            showArmy(urlStable);
            showArmy(urlWorkshop);
        }

        function goToVillage(id) {

            showAllUnitsInThisVillage(id);

            let url = "https://"+world+".plemiona.pl/game.php?"+playerId+"village=" + id + "&screen=place&mode=units";

            let htmlElem = document.createElement("html");
            htmlElem.innerHTML = httpGet(url);
            let element = htmlElem.querySelectorAll("#units_away");
            if (element == null||element.length==0) {
                console.log("Brak wspieranych wiosek.");
                console.log("-----");
                return;
            }
            for(let i =0;i<element.length;i++){
              showArmy(element[i]);
            }
            console.log("Wyslane wojska na pomoc z tej wioski : "+amountOfDeffInThisVillage+ " jednostek.");
            console.log("------------------------------------------------------------");
            amountOfDeffInAllVillages+=amountOfDeffInThisVillage;
            amountOfDeffInThisVillage=0;
        }

        let idVillage = document.querySelector('#menu_row2_village > a').href;
        idVillage = idVillage.substring(idVillage.indexOf("=") + 1, idVillage.indexOf("&"));
        let url = 'https://'+world+'.plemiona.pl/game.php?'+playerId+'village=' + idVillage + '&screen=info_player';
        //console.log(url);

        let htmlElem = document.createElement("html");
        htmlElem.innerHTML = httpGet(url);
        //console.log(htmlElem);
        let id = htmlElem.getElementsByClassName("village_anchor");
        //console.log(id);
        for (let i = 0; i < id.length; i++) {
            console.log("Wioska o id: " + id[i].getAttribute("data-id"));
            goToVillage(id[i].getAttribute("data-id"));
        }
        console.log("Calkowita ilosc wojsk ktore gracz wyslal na pomoc: "+amountOfDeffInAllVillages);
    }

    window.addEventListener("keydown", operation);
})();
