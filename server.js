
//example for  appartement https://www.leboncoin.fr/ventes_immobilieres/1085676416.htm?ca=12_s
//example for home  https://www.leboncoin.fr/ventes_immobilieres/1088191366.htm?ca=12_s
//example for Location https://www.leboncoin.fr/locations/1080724186.htm?ca=12_s

//to make server
var express=require('express');
//In order to take  informations in downloaded file
var cheerio = require('cheerio');
//to make request
var request=require('request');
//to read documents which are in the same folder
var fs= require('fs');
//to read through html document 'urlLeBonCoin = req.body.p1;'
var bodyParser=require("body-parser");
var path= require('path');
//In order to server works
var app=express();
//To scrapp the web
var urlLeBonCoin;
var urlLesMeilleursAgents="https://www.meilleursagents.com/prix-immobilier/";
var port=3500;
var	price;
var city;
var kindOfEstate;
var room;
var squareMeter;
var GES;
var energyClass;
var meuble;
var finalResult='';
var htmlResult;
var vente=false;
//To read JSON file
var content_LeBonCoin= fs.readFileSync("moduleLeBonCoin.json");
var content_MeilleurAgent= fs.readFileSync("moduleMeilleurAgent.json");
//To work throught the JSON file 
var realEstate=JSON.parse(content_LeBonCoin);
var MeilleurAgent=JSON.parse(content_MeilleurAgent);


app.use(bodyParser.urlencoded({ extended: true }));
// to use css on index.html
app.use(express.static(__dirname + '/assets'));
//server take the page at the level '/', and THEN send the html page
app.get('/', (request, response) => {response.sendFile(__dirname+'/index.html')});
//When the methode 'post' is used on the index.html: for the button , when the url has been sent.
app.post('/', function(req, res){

	//we get the url 
     urlLeBonCoin = req.body.p1;
    //we look if it's a rent or a sale, because the web page is different.
     SaleOrRent(urlLeBonCoin);
    //The first request to go in the url given by the user and scrap informations 
	request(urlLeBonCoin,function(err,resp,body){

		if (err){
		console.log(err);
		}else{
			var data;
		//To go through the html
		 	var $ = cheerio.load(body);						
		//Price of real estate
			$('span.value:nth-child(3)').filter(function(){
			data=$(this);
			//We have to use the fonction text() to read it 
			price=data.text();
			realEstate.price=price;
			})
		//City of real Estate
			$('div.line:nth-child(6) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			data=$(this);
			city=data.text();		
			realEstate.city=city;
			})
		//Kind of real estate
			$('div.line:nth-child(7) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			data=$(this);
			kindOfEstate=data.text();
			realEstate.kindOfEstate=kindOfEstate;
			})
		//Number of room
			$('div.line:nth-child(8) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			data=$(this);
			room=data.text();		
			realEstate.room=room;
			})
		if (vente){	
		//Squarred Meter
			$('div.line:nth-child(9) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			data=$(this);
			squareMeter=data.text();
			realEstate.squareMeter=squareMeter;
			console.log("TEEST3 "+realEstate.squareMeter)
			}) 
		//GES
			$('div.line:nth-child(10) > h2:nth-child(1) > span:nth-child(2) > a:nth-child(1)').filter(function(){
			data=$(this);
			GES=data.text();
			realEstate.GES=GES;
			})
		//Energy Class
			$('div.line:nth-child(11) > h2:nth-child(1) > span:nth-child(2) > a:nth-child(1)').filter(function(){
			data=$(this);
			energyClass=data.text();
			realEstate.energyClass=energyClass;
			})
		}
		//if it's a rent 
		else if (!vente){
			realEstate.kindOfEstate="location";
			//meuble
			$('div.line:nth-child(9) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			data=$(this);
			meuble=data.text();		
			realEstate.meuble=meuble;
			})

			//Squarred Meter
			$('div.line:nth-child(10) > h2:nth-child(1) > span:nth-child(2)').filter(function(){
			data=$(this);
			squareMeter=data.text();
			realEstate.squareMeter=squareMeter;
			console.log("TEEST3 "+realEstate.squareMeter)
			})

			//GES
			$('div.line:nth-child(11) > h2:nth-child(1) > span:nth-child(2) > a:nth-child(1)').filter(function(){
			data=$(this);
			GES=data.text();
			realEstate.GES=GES;
			})
			//Energy Class
			$('div.line:nth-child(12) > h2:nth-child(1) > span:nth-child(2) > a:nth-child(1)').filter(function(){
			data=$(this);
			energyClass=data.text();
			realEstate.energyClass=energyClass;
			})

		}
		else{
			console.log("Sorry , but we only handle sell or location");
		}

			realEstate.city=Clean(realEstate.city,false);
			realEstate.kindOfEstate=Clean(realEstate.kindOfEstate,false);
			realEstate.price=Clean(realEstate.price,true);
			realEstate.squareMeter=Clean(realEstate.squareMeter,true);

			
			console.log("price = "+realEstate.price);
			console.log("city = "+ realEstate.city);
			console.log("kindOfEstate= "+ realEstate.kindOfEstate);
			console.log("room= "+ realEstate.room);
			console.log("squareMeter="+realEstate.squareMeter);
			console.log("GES:"+realEstate.GES);
			console.log("energyClass="+realEstate.energyClass);

		// Seconde request to go on the right web page on the  web site 'lesMeilleursAgents'
		 request(urlLesMeilleursAgents+realEstate.city+'/',function(err2,resp2,body2){ 

				if(err2){
				console.log(err2);
				}
				else{

					var $ = cheerio.load(body2);

					//We scrapp necessary informations according to the kind of the real estate
					switch(realEstate.kindOfEstate){

						case "maison":
						//low price according to the web site 'lesMeilleursAgents'
						var bestPriceHome=$('div.medium-uncollapse:nth-child(3) > div:nth-child(2)');
						var bestPriceHomeText=bestPriceHome.text();
						//Middle price according to the web site 'lesMeilleursAgents'
						var middlePriceHome=$('div.medium-uncollapse:nth-child(3) > div:nth-child(3)');
						var middlePriceHomeText=middlePriceHome.text();
						//The worst price according to the web site 'lesMeilleursAgents'
						var worstPriceHome=$('div.medium-uncollapse:nth-child(3) > div:nth-child(4)');
						var worstPriceHomeText=worstPriceHome.text();

						bestPriceHomeText=Clean(bestPriceHomeText,true);
						middlePriceHomeText=Clean(middlePriceHomeText,true);
						worstPriceHomeText=Clean(worstPriceHomeText,true);

						
						MeilleurAgent.home.best=bestPriceHomeText;
						MeilleurAgent.home.middle=middlePriceHomeText;
						MeilleurAgent.home.worst=worstPriceHomeText;
						console.log("bestPriceAppartmentText = "+MeilleurAgent.home.best);
						console.log("middlePriceAppartmentText = "+ MeilleurAgent.home.middle);
						console.log("worstPriceAppartmentTexte= "+ MeilleurAgent.home.worst);
						//Compare informations which have been caught in the two web site to tell 
						//if it's a good deal or not 
						finalResult=Result(realEstate.kindOfEstate);
						console.log(finalResult)
						//We put the result in a html form
						htmlResult=Html();

						res.send(htmlResult);
						
						
						break;


						case "appartement":
							var bestPriceAppartement=$('div.medium-uncollapse:nth-child(2) > div:nth-child(2)');

							var bestPriceAppartementText=bestPriceAppartement.text();

							var middlePriceAppartement=$('div.medium-uncollapse:nth-child(2) > div:nth-child(3)');
							var middlePriceAppartementText=middlePriceAppartement.text();

							var worstPriceAppartement=$('div.medium-uncollapse:nth-child(2) > div:nth-child(4)');
							var worstPriceAppartementText=worstPriceAppartement.text();
							
						   	
						   	bestPriceAppartementText=Clean(bestPriceAppartementText,true);
						   	middlePriceAppartementText=Clean(middlePriceAppartementText,true);
						   	worstPriceAppartementText=Clean(worstPriceAppartementText,true);

							MeilleurAgent.appartement.middle=middlePriceAppartementText;		
							MeilleurAgent.appartement.best=bestPriceAppartementText;
							MeilleurAgent.appartement.worst=worstPriceAppartementText;
							console.log("bestPriceAppartmentText = "+MeilleurAgent.appartement.best);
							console.log("middlePriceAppartmentText = "+ MeilleurAgent.appartement.middle);
							console.log("worstPriceAppartmentTexte= "+ MeilleurAgent.appartement.worst);

							finalResult=Result(realEstate.kindOfEstate);
							htmlResult=Html();
							res.send(htmlResult);
						

							
						break;

						case "location":

						var bestPriceLocation=$('div.row:nth-child(4) > div:nth-child(2)');
						var bestPriceLocationText=bestPriceLocation.text();

						var middlePriceLocation=$('div.row:nth-child(4) > div:nth-child(3)');
						var middlePriceLocationText=middlePriceLocation.text();

						var worstPriceLocation=$('div.row:nth-child(4) > div:nth-child(4)');
						var worstPriceLocationText=worstPriceLocation.text();

						bestPriceLocationText=Clean(bestPriceLocationText,true);
						middlePriceLocationText=Clean(middlePriceLocationText,true);
						worstPriceLocationText=Clean(worstPriceLocationText,true);


						MeilleurAgent.location.best=bestPriceLocationText;
						MeilleurAgent.location.middle=middlePriceLocationText;
						MeilleurAgent.location.worst=worstPriceLocationText;
						console.log("bestPriceAppartmentText = "+MeilleurAgent.location.best);
						console.log("middlePriceAppartmentText = "+ MeilleurAgent.location.middle);
						console.log("worstPriceAppartmentTexte= "+ MeilleurAgent.location.worst);

						finalResult=Result(realEstate.kindOfEstate);
						htmlResult=Html();
						res.send(htmlResult);
						
						break;

					}
				
				}
				
			})
		}
	})
})

//a function allow us to have a int or a name of city correctly writted.
function Clean(arg,kind){
		
		if(kind){
		arg=arg.replace(/€/g,"");
		arg=arg.replace(/m2/g,"");
		arg=arg.replace(/\s/g,"");
		arg=arg.trim();
		arg=parseInt(arg,10);
		
		}
		else if (!kind){ 
		arg=arg.toLowerCase();
		arg=arg.trim();
		arg=arg.replace(/ /g,"-");
		
		}
		else{
			console.log(" one of your arguments are not correct")
		}
		return arg;

		}

//this function allow us to tell if either a good deal or a bad deal.
function Result(kind){

	var buyIt=" buy it , you wil never find better !! ";
	var goodDeal="it's a good deal ";
	var youCanHaveBetter="you can have better .. you have to negociate ";
	var dontBuyIt="it's a joke ! don't buy it ";
	var priceSquareMetter=(realEstate.price)/(realEstate.squareMeter); 
  	var RealLowPrice;
	var RealmiddlePrice;
	var RealHightPrice;
	var error ="There are errors on your informations reguarding your real estate "+"Recall that we only handle location and sell";

   switch(kind){

  	case("maison"):
   	console.log("home priceSquareMetter : " + priceSquareMetter);

  	RealLowPrice = MeilleurAgent.home.best;
	RealmiddlePrice = MeilleurAgent.home.middle;
	RealHightPrice = MeilleurAgent.home.worst;
	
	if( priceSquareMetter<=RealLowPrice){

		console.log(buyIt);
		return buyIt;
		
	}
	else if (priceSquareMetter>RealLowPrice &&  priceSquareMetter<=RealmiddlePrice){
		console.log(goodDeal);
		return goodDeal;

	}
	else if ( priceSquareMetter>RealmiddlePrice && priceSquareMetter<=RealHightPrice){

		console.log(youCanHaveBetter);
		return youCanHaveBetter;
	}
	else if (priceSquareMetter>RealHightPrice){
		console.log(dontBuyIt);
		return dontBuyIt;
	}
	else{
		console.log(error);
		return error;
	}
	break;
	
  	case ("appartement"):
  	RealLowPrice = MeilleurAgent.appartement.best;
	RealmiddlePrice = MeilleurAgent.appartement.middle;
	RealHightPrice = MeilleurAgent.appartement.worst;
	console.log("appartement priceSquareMetter : " + priceSquareMetter);
	
	if( priceSquareMetter<=RealLowPrice){

		console.log(buyIt);

		return buyIt;

	}
	else if(priceSquareMetter>RealLowPrice &&  priceSquareMetter<=RealmiddlePrice){
		console.log(goodDeal);
		return goodDeal;
	}
	else if ( priceSquareMetter>RealmiddlePrice && priceSquareMetter<=RealHightPrice){

		console.log(youCanHaveBetter);
		return youCanHaveBetter;
	}
	else if ( priceSquareMetter>RealHightPrice){
		console.log(dontBuyIt);
		return dontBuyIt;
	}
	else{
		console.log(error);
		return error;
	}
	break;	

  	case("location"):
  	 RealLowPrice = MeilleurAgent.location.best;
	 RealmiddlePrice = MeilleurAgent.location.middle;
	 RealHightPrice = MeilleurAgent.location.worst;
	 console.log("location priceSquareMetter : " + priceSquareMetter);

	if( priceSquareMetter<=RealLowPrice){

		console.log(buyIt);
		return buyIt
	}
	else if(priceSquareMetter>RealLowPrice &&  priceSquareMetter<=RealmiddlePrice){
		console.log(goodDeal);
		return goodDeal;
	}
	else if ( priceSquareMetter>RealmiddlePrice && priceSquareMetter<=RealHightPrice){

		console.log(youCanHaveBetter);
		return youCanHaveBetter;
	}
	else if ( priceSquareMetter>RealHightPrice){
		console.log(dontBuyIt);
		return dontBuyIt;
	}
	else{
		console.log(error);
		return error;
	}
	break;


   }
}

//We have to know if it's a rent or a sale
//because in the web site 'leboncoin', the squarred metter is not 
// at the same place. 
function SaleOrRent(argument){
var caractere;
var location;
caractere=argument.substring(25,26);
     
      if ("l"==caractere){
      	vente=false;
      }
      else if ("v"==caractere) {
      	vente=true;
      }
 }  	


//to send the response in html form, with the informations 
function Html(){

	var html='<!DOCTYPE html><html><head><title>goodDeal</title></head>'+
								    '<body><form style="text-align:center"><legend>Resultat</legend>'+
								    '<h1> '+finalResult+' </h1> <br /></form>'+
								    '</body></html>';
	return html;

}

app.listen(port);
console.log("express server is listening on port "+port);
