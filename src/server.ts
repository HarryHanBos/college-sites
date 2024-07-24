import https = require('https');
import fs = require('fs');
require('log-timestamp');

import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { COLLEGE_SCHEMA, ON_CAMPUS_ARREST, NON_CAMPUS_ARREST, RESIDENCE_HALL_ARREST, REGISTRY_SCHEMA, COMPOSITE_SCHEMA } from './schema';
import e = require('express');

// Set up the database connection.
// Cloud deployment
mongoose.connect('mongodb+srv://appAdmin:5vMH7Yv6pMLQ5vII@cluster0-5vruw.mongodb.net/test', {useNewUrlParser: true});

// Connect local
//mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

var db = mongoose.connection;

// Connect to the existing scoreboardAll schema.
const Scoreboard = mongoose.model('scoreboardAll', COLLEGE_SCHEMA, 'scoreboardAll');

// Connect to the existing ?? schema.
const Crime = mongoose.model('onCampusCrime', ON_CAMPUS_ARREST, 'onCampusCrime');

// Connect to the existing nonCampusArrest schema.
const OnCampusArrest = mongoose.model('onCampusArrest', ON_CAMPUS_ARREST, 'onCampusArrest');

// Connect to the existing nonCampusArrest schema.
const NonCampusArrest = mongoose.model('nonCampusArrest', NON_CAMPUS_ARREST, 'nonCampusArrest');

// Connect to the existing ResidenceHallArrest schema.
const ResidenceHallArrest = mongoose.model('residenceHallArrest', RESIDENCE_HALL_ARREST, 'residenceHallArrest');

const OffenderRegistry = mongoose.model('offenderRegistry', REGISTRY_SCHEMA, 'offenderRegistry');

const CompositeScores = mongoose.model('compositeScores', COMPOSITE_SCHEMA, 'compositeScores');

db.on('error', () => {
    console.error.bind(console, 'connection error:')
});

db.once('open', function() {
  console.log('Successfull connection to test database.');
});

function loggerMiddleware(request: express.Request, response: express.Response, next: any) {
    response.header('Access-Control-Allow-Origin', '*');
    console.log(`${request.method} ${request.path} ${JSON.stringify(request.query)}`);
    next();
}

const BASE_URI = '/api';
const API_PORT = 8080;

const app = express();

// Helmet.js protections.
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());

app.use(bodyParser.json({
    limit: 50000000
}));

// Register middleware
app.use(loggerMiddleware);

// Set default route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

const asyncMiddleware = (fn: (arg0: any, arg1: any, arg2: any) => any) =>
  (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};

// Get a list of all of the colleges
//
// @param state - Abbreviation of state to filter on 
// @param name  - Letters of college. Returns the first 10 colleges
// that match for autocomplete.
app.get(BASE_URI + '/colleges', asyncMiddleware(async (req, res, next) => {
    try {
        let query = {};
        let state = req.query['state'];
        if (state) {
            query = { STABBR: state };
            const stateScores = await Scoreboard.find(query, 
                { _id:0, UNITID: 1, INSTURL: 1, INSTNM: 1, STABBR: 1 });
            res.send(stateScores);
            return;
        }
        
        let nameFilter = req.query['name'];
        if (nameFilter) {
            let nameRegExp = new RegExp(nameFilter,'i');
            query = { INSTNM: nameRegExp};
            const stateScores = await Scoreboard.find(query, 
                { _id:0, UNITID: 1, INSTURL: 1, INSTNM: 1, STABBR: 1, CITY:1, location:1, ZIP: 1 }).limit(10);
            res.send(stateScores);
            return;
        }

        // Run without query for bots.
        const stateScores = await Scoreboard.find(query, 
            { _id:0, UNITID: 1, INSTURL: 1, INSTNM: 1, STABBR: 1 });
        res.send(stateScores);

    } catch (e) {
        console.error('/colleges failure:' + e);
    }
}));

// Set College route
app.get(BASE_URI + '/college', asyncMiddleware(async (req, res, next) => {
    try {
        //hhan
        let unitid = req.query['unitid'];
        //based on state
        let state = req.query['state'];
        let satscore = req.query['satscore'];
        let earning = req.query['earning'];
        let cost = req.query['cost'];

        //hhan,  http://localhost:3000/college?unitid=130794
        if (unitid){
            console.log('Looking up college with ID: ' + unitid);
            const stateScores = await Scoreboard.findOne({UNITID: unitid}
                /*, 
                { _id:0, INSTNM:1, INSTURL:1,CITY:1, ZIP:1, 
                    ADM_RATE:1, ADM_RATE_ALL:1,  //admi
                    SATVR75:1, SATMT75:1, SATVR25:1, SATMT25:1, SATVRMID:1, SATMTMID:1, SAT_AVG:1, SAT_AVG_ALL:1, //sat
                    ACTCM75:1, ACTCM25:1,  ACTCMMID:1, //act
                    DEATH_YR2_RT:1, C150_4:1, C150_L4:1, //completion,
                    NPT4_PUB:1, NPT4_PRIV:1, TUITIONFEE_IN:1, TUITIONFEE_OUT:1, COSTT4_A:1, //tuition and cost  
                    MN_EARN_WNE_P6:1, MN_EARN_WNE_P7:1, MN_EARN_WNE_P8:1, MN_EARN_WNE_P9:1, MN_EARN_WNE_P10:1, //earnings
                    CDR2:1, CDR2_DENOM:1, CDR3:1, CDR3_DENOM:1,  //repayment default rate
                    RPY_1YR_RT:1, RPY_3YR_RT:1, RPY_5YR_RT:1, RPY_7YR_RT:1, // repayment not default , but declined for years
                    AGE_ENTRY:1, MEDIAN_HH_INC:1, POVERTY_RATE:1, UNEMP_RATE:1, UGNONDS:1, GRADS:1, //student
                    NUMBRANCH:1, HIGHDEG:1, //school, 0-non, 1-cert,2-asso, 3-bach, 4-grad
                    MENONLY:1, WOMENONLY:1, AVGFACSAL:1, //school,average teacher salary
                    ICLEVEL:1, //school, 1-4yr,2-2yr,3-less 2 yr
                    PCTPELL:1, PCTFLOAN:1,CUML_DEBT_P75:1, CUML_DEBT_P25:1, GRAD_DEBT_MDN_SUPP:1, GRAD_DEBT_MDN10YR_SUPP:1, //aid
                    PRGMOFR:1, PCIP01:1,PCIP03:1, PCIP04:1, PCIP05:1, PCIP09:1, PCIP10:1, PCIP11:1,PCIP12:1,PCIP13:1,  //adademic
                    PCIP14:1, PCIP15:1, PCIP16:1, PCIP19:1, PCIP22:1, PCIP23:1, PCIP24:1, PCIP25:1, PCIP26:1, PCIP27:1,
                    PCIP29:1, PCIP30:1, PCIP31:1, PCIP38:1, PCIP39:1, PCIP40:1, PCIP41:1, PCIP42:1, PCIP43:1, PCIP44:1,
                    PCIP45:1, PCIP46:1, PCIP47:1, PCIP48:1, PCIP49:1, PCIP50:1, PCIP51:1, PCIP52:1, PCIP54:1,                   
                }*/
                ); 
            res.send(stateScores);
        }
        else if (state) {
            console.log('Looking up colleges from: ' + state);
            // db.scoreboardAll.find( { STABBR: "MA" }, { _id:0, INSTNM: 1, INSTURL: 1 ,CITY:1, ZIP:1,} ).sort({INSTNM:1});
            const stateScores = await Scoreboard.find({STABBR: state}, 
                { _id:0, INSTNM: 1, INSTURL: 1 ,CITY:1, ZIP:1,});
            res.send(stateScores);
            
        } else if (satscore) {
                let satscore = req.query['satscore'];
                console.log('Looking up colleges with your SAT score: ' + satscore);
                // db.scoreboardElement.find( {SAT_AVG: {$lte:1000}}, { _id:0, INSTNM: 1, INSTURL: 1 ,CITY:1, ZIP:1,SAT_AVG_ALL:1,} ).sort({INSTNM:1});
                const satScores = await Scoreboard.find({SAT_AVG: {"$lte":satscore}}, { _id:0, INSTNM: 1, INSTURL: 1 ,CITY:1, ZIP:1,SAT_AVG:1,});
                console.log(satScores.length + ' scores returned');
                res.send(satScores);    
        } else if (earning) {
            let earning = req.query['earning'];
            console.log('Looking up colleges earns at least this much after 10 years graduation: ' + earning);
            // db.scoreboardElement.find( {MD_EARN_WNE_P10: {$nin : ["NULL","PrivacySuppressed"]}}, { _id:0, INSTNM: 1, INSTURL: 1 ,CITY:1, ZIP:1,SAT_AVG:1,MD_EARN_WNE_P10:1,} ).sort({MD_EARN_WNE_P10:-1})
            const earnings = await Scoreboard.find({MD_EARN_WNE_P10: {"$gte":earning}}, { _id:0, INSTNM: 1, INSTURL: 1 , MD_EARN_WNE_P10:1,});
            console.log(earnings.length + ' earnings returned');
            res.send(earnings);    
        } else if (cost) {
            let cost = req.query['cost'];
            console.log('Looking up colleges cost is less than this amount: ' + cost);
            // db.scoreboardAll.find( {COSTT4_A: {$lte:40000}}, { _id:0, INSTNM: 1, INSTURL: 1 ,CITY:1,COSTT4_A:1,} )
            const costs = await Scoreboard.find({COSTT4_A: {"$lte":cost}}, { _id:0, INSTNM: 1, INSTURL: 1 , COSTT4_A:1,});
            console.log(costs.length + ' costs returned');
            res.send(costs);    
        } else {
            res.send('Invalid argument.  Please send state, satscore, cost or earning.');
        }

    } catch (e) {
        console.error('/college failure:' + e);
    }
  
}));

/**
 * Return all colleges within a range.
 *
 * http://localhost:3000/close?lat=-71.11&lng=42.35
 */
//first call to get colleges
app.get(BASE_URI + '/close', asyncMiddleware(async (req, res, next) => {
    try{
        let latitude: Number = req.query['lat'];
        if (latitude > 90 || latitude < -90) {
            res.send('Invalid argument.  Latitude is not valid.');
            return;
        }
        let longitude: Number = req.query['lng'];
        if (longitude > 180 || longitude < -180) {
            res.send('Invalid argument.  Longitude is not valid.');
            return;
        }
        //search for all colleges in 50 miles
        const places = await Scoreboard.find({ location: { $geoWithin: { $centerSphere: [[longitude, latitude], 0.005] } } }, 
            {UNITID: 1, INSTNM:1, CITY:1, STABBR: 1, location:1, ZIP:1, UG: 1})
    
        res.send(places);
        console.log(places.length + ' places returned');    
    } catch (e) {
        console.error('/close failure:' + e);
    }
}));

/**
 * Return all colleges within a list.
 *
 * http://localhost:3000/collegeList?id=[100654,110421]
 */
app.get(BASE_URI + '/collegeList', asyncMiddleware(async (req, res, next) => {
    try{
        let idFilter: string = req.query['id']
        if (!idFilter) {
            res.send('Invalid argument.  Please send a valid institution ID.');
            return;
        }
        let idSearch = JSON.parse(idFilter);

        //search for all colleges in 50 miles
        const places = await Scoreboard.find({ UNITID: { $in : idSearch } }, 
            {UNITID: 1, INSTNM:1, CITY:1, STABBR: 1, location:1, ZIP:1, UG: 1})
    
        res.send(places);
        console.log(places.length + ' places returned');    
    } catch (e) {
        console.error('/collegeList failure:' + e);
    }
}));

/**
 * Return all colleges within a range.
 *
 * http://localhost:3000/crime?inst=100690
 */

//this is the second call, for Crime DB.
app.get(BASE_URI + '/crime', asyncMiddleware(async (req, res, next) => {
    try {
        let institutionId: Number = req.query['inst']
        if (!institutionId) {
            res.send('Invalid argument.  Please send a valid institution ID.');
            return;
        }

        let cityFilter: string = req.query['city']
        if (!cityFilter) {
            res.send('Invalid argument.  Please send a valid City.');
            return;
        }

        // Sometimes there are more than one branch.  If we have crime data for multiple 
        // institutions, try to use the city to distinguish the location.
        let crime = await Crime.find({ UNITID_CAL: institutionId});
        if (crime.length > 1) {
            crime = await Crime.find( {UNITID_CAL: institutionId, City: {$regex: new RegExp('^' + cityFilter, 'i')}});
        }

        res.send(crime);
    } catch (e) {
        console.error('/crime failure:' + e);
    }
}));

//this is the second call, for Crime DB.
app.get(BASE_URI + '/murder', asyncMiddleware(async (req, res, next) => {
    try {
        let yearFilter: string = req.query['year']
        if (!yearFilter) {
            res.send('Invalid argument.  Please send a valid year.');
            return;
        }

        var murders;
        if (yearFilter.indexOf("15") != -1) {
            murders = await Crime.find({ MURD15: {$gt: 0} }).sort({ MURD15: -1});
        } else if (yearFilter.indexOf("16") != -1) {
            murders = await Crime.find({ MURD16: {$gt: 0} }).sort({ MURD16: -1});
        } else if (yearFilter.indexOf("17") != -1) {
            murders = await Crime.find({ MURD17: {$gt: 0} }).sort({ MURD17: -1});
        }

        res.send(murders);
    } catch (e) {
        console.error('/murder failure:' + e);
    }
}));

//http://localhost:3000/nonCampusArrest?inst=100690
app.get(BASE_URI + '/nonCampusArrest', asyncMiddleware(async (req, res, next) => {
    try {
        let institutionId: Number = req.query['inst']

        if (institutionId) {
            
            const nonCampusArrest = await NonCampusArrest.find({ UNITID_CAL: institutionId});

            res.send(nonCampusArrest);
        } else {
            res.send('Invalid argument.  Please send a valid institution ID.');
        }
    } catch (e) {
        console.error('/nonCampusArrest failure:' + e);
    }
}));

//http://localhost:3000/onCampusArrest?inst=166638&city=BOSTON
app.get(BASE_URI + '/onCampusArrest', asyncMiddleware(async (req, res, next) => {
    try {
        let institutionId: Number = req.query['inst']
        if (!institutionId) {
            res.send('Invalid argument.  Please send a valid institution ID.');
        }

        let cityFilter: string = req.query['city'];
        if (!cityFilter) {
            res.send('Invalid argument.  Please send a valid City.');
        }
        // let cityRegExp = new RegExp('^' + cityFilter, 'i');

        // http://localhost:3000/crime?inst=167260&city=Dudley

        // {UNITID_CAL: 166638, City: /Boston/i}
        // console.log(JSON.stringify({ UNITID_CAL: institutionId, city: cityRegExp.source}));

        const onCampusArrest = await OnCampusArrest.find( {UNITID_CAL: institutionId, City: {$regex: new RegExp('^' + cityFilter, 'i')}});
        //const onCampusArrest = await OnCampusArrest.find({ UNITID_CAL: institutionId,
        //    city: {$regex: cityRegExp, $options: 'i'} });
        res.send(onCampusArrest); 
    } catch (e) {
        console.error('/onCampusArrest failure:' + e);
    }
}));


//http://localhost:3000/residenceHallArrest?city=BOSTON
app.get(BASE_URI + '/residenceHallArrest', asyncMiddleware(async (req, res, next) => {
    try {
        let institutionId: Number = req.query['inst']

        if (institutionId) {
            const residenceHallArrest = await ResidenceHallArrest.find({ UNITID_CAL: institutionId});
            res.send(residenceHallArrest);
        } else {
            res.send('Invalid argument.  Please send a valid institution ID.');
        }
    } catch (e) {
        console.error('/residenceHallArrest failure:' + e);
    }
}));

//http://localhost:3000/offender?state=MA
app.get(BASE_URI + '/offender', asyncMiddleware(async (req, res, next) => {
    try {
        let stateAbbr: String = req.query['state']
        if (stateAbbr) {
            const offenders = await OffenderRegistry.findOne({ abbr: stateAbbr});
            res.send(offenders);
        } else {
            res.send('Invalid argument.  Please send a valid state abbrev.');
        }
    } catch (e) {
        console.error('Offender failure:' + e);
    }
}));

// http://localhost:3000/compositeScores?inst=4131200
app.get(BASE_URI + '/compositeScores', asyncMiddleware(async (req, res, next) => {
    try {
        let inst: String = req.query['inst']
        if (inst) {
            const scores = await CompositeScores.findOne({ OPEID: inst});
            res.send(scores);
        } else {
            res.send('Invalid argument.  Please send a valid institution id.');
        }
    } catch (e) {
        console.error('Composite failure:' + e);
    }
}));

// Start listening on port.
app.listen(API_PORT, () => console.log('Example api server listening on port' + API_PORT));

/*
  Diable SSL for now

if (process.argv.length == 3) {
    console.log('Start using ssl');
    const options = {
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }
    https.createServer(options, app).listen(443);
}
*/

// Add error logging
process.on('uncaughtException', function(err) {
    console.error('FATAL EXCEPTION:' + err);
});

// Handle rejection eror.
process.on('unhandledRejection', (error, promise) => {
    console.log('Forgoten promise rejection: ', promise);
    console.log('Log resulting:', error);
});