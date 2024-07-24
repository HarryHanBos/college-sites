import mongoose from 'mongoose';

export var COLLEGE_SCHEMA = new mongoose.Schema({
    UNITID: Number, /* College ID - This may not be the ID we want, as there are several. */
    CITY: String,
    STABBR:  String,
    ZIP: String,
    INSTNM: String,
    INSTURL: String,  //hhan
    LATITUDE: Number,
    LONGITUDE: Number,
    SAT_AVG: Number,
    MD_EARN_WNE_P10: Number, /* Median earnings of students working and not enrolled 10 years after entry */
    COSTT4_A: Number,
    UG: Number /* Undergrad enrollment - Total number of students */
});

export var ON_CAMPUS_ARREST = new mongoose.Schema({
    UNITID_P: Number,
    INSTNM: String,
    BRANCH: String,
    Address: String,
    City: String,
    State: String,
    ZIP: Number,
    men_total: Number,
    women_total:Number,
    Total:Number,
    WEAPON15: Number,
    DRUG15: Number,
    LIQUOR15: Number,
    WEAPON16: Number,
    DRUG16: Number,
    LIQUOR16: Number,
    WEAPON17: Number,
    DRUG17: Number,
    LIQUOR17: Number,
    //hhan, connected to the updated onCampusCrime DB, with 4 additional fields
    UNITID_CAL: Number,
})

//hhan
export var NON_CAMPUS_ARREST = new mongoose.Schema({
    UNITID_P: Number,
    INSTNM: String,
    BRANCH: String,
    Address: String,
    City: String,
    State: String,
    ZIP: Number,
    men_total: Number,
    women_total:Number,
    Total:Number,
    WEAPON15: Number,
    DRUG15: Number,
    LIQUOR15: Number,
    WEAPON16: Number,
    DRUG16: Number,
    LIQUOR16: Number,
    WEAPON17: Number,
    DRUG17: Number,
    LIQUOR17: Number,
    UNITID_CAL: Number,
})

export var RESIDENCE_HALL_ARREST = new mongoose.Schema({
    UNITID_P: Number,
    //INSTNM: String,
    BRANCH: String,
    //Address: String,
    City: String,
    State: String,
    ZIP: Number,
    men_total: Number,
    women_total:Number,
    Total:Number,
    WEAPON15: Number,
    DRUG15: Number,
    LIQUOR15: Number,
    WEAPON16: Number,
    DRUG16: Number,
    LIQUOR16: Number,
    WEAPON17: Number,
    DRUG17: Number,
    LIQUOR17: Number,
    UNITID_CAL: Number,
})

export var REGISTRY_SCHEMA = new mongoose.Schema({
    abbr: String,
    state: String,
    link:  String,
    sexOffenders: Number,
    population: Number,
    squareMiles: Number,
    offenderZip: Array<String>()
});

export var COMPOSITE_SCHEMA = new mongoose.Schema({
    OPEID: Number,
    CompositeScore_2006_2007: Number,
    CompositeScore_2007_2008: Number,
    CompositeScore_2008_2009: Number,
    CompositeScore_2009_2010: Number,
    CompositeScore_2010_2011: Number,
    CompositeScore_2011_2012: Number,
    CompositeScore_2012_2013: Number,
    CompositeScore_2013_2014: Number,
    CompositeScore_2014_2015: Number,
    CompositeScore_2015_2016: Number,
    CompositeScore_2016_2017: Number,
    CompositeScore_2017_2018: Number
})
