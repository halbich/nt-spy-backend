"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTeamIntoDb = void 0;
const team_1 = __importDefault(require("../models/team"));
const player_1 = __importDefault(require("../models/player"));
const translate_countries_1 = require("./translate-countries");
const insertTeamIntoDb = (team) => __awaiter(void 0, void 0, void 0, function* () {
    // Decide team category, refactor into separate function maybe later
    let category = 'U21';
    let averageAge = 0;
    for (let player of team) {
        if (player.NTmatches > 0) {
            category = 'NT';
            break;
        }
        averageAge += (player.age_years * 112 + player.age_days);
    }
    averageAge = (averageAge / 112) / team.length;
    if (averageAge > 22 && category === 'U21') {
        category = 'NT';
    }
    ;
    // If nation already in the db, find and update
    let nationality = team[0].nationality;
    // Translate country name to English (works only for Czech lang. now)
    if (translate_countries_1.CountryTranslation[nationality]) {
        nationality = translate_countries_1.CountryTranslation[nationality];
    }
    const existingTeam = yield team_1.default.findOne({ country: nationality, category: category });
    // console.log(existingTeam);
    if (existingTeam) {
        for (let player of team) {
            let oldPlayerData = yield player_1.default.findOne({ ht_id: player.ht_id });
            if (oldPlayerData) {
                const date = new Date();
                // If player was created or updated at least one hour ago - protection against accidental multiple upload
                if (date.valueOf() - oldPlayerData.createdAt.valueOf() > 3600000 &&
                    date.valueOf() - oldPlayerData.updatedAt.valueOf() > 3600000) {
                    // update old player
                    oldPlayerData.injury = player.injury;
                    oldPlayerData.onTL = player.onTL;
                    oldPlayerData.TSI = player.TSI;
                    oldPlayerData.experience = player.experience;
                    oldPlayerData.form.push(player.form[0]);
                    oldPlayerData.stamina.push(player.stamina[0]);
                    oldPlayerData.NTmatches = player.NTmatches;
                    oldPlayerData.U21matches = player.U21matches;
                    oldPlayerData.isInTeam = player.isInTeam;
                    oldPlayerData.goalkeeping = player.goalkeeping;
                    oldPlayerData.defending = player.defending;
                    oldPlayerData.playmaking = player.playmaking;
                    oldPlayerData.winger = player.winger;
                    oldPlayerData.passing = player.passing;
                    oldPlayerData.scoring = player.scoring;
                    oldPlayerData.setPieces = player.setPieces;
                    oldPlayerData.save();
                }
                else {
                    console.log("Recent player data present, updating stopped.");
                }
            }
            else {
                // create a new player
                let newPlayer = new player_1.default({
                    nationality: nationality,
                    name: player.name,
                    ht_id: player.ht_id,
                    speciality: player.speciality,
                    injury: player.injury,
                    onTL: player.onTL,
                    age_days: player.age_days,
                    age_years: player.age_years,
                    TSI: player.TSI,
                    experience: player.experience,
                    leadership: player.leadership,
                    form: player.form,
                    stamina: player.stamina,
                    NTmatches: player.NTmatches,
                    U21matches: player.U21matches,
                    isInTeam: player.isInTeam,
                    goalkeeping: player.goalkeeping,
                    defending: player.defending,
                    playmaking: player.playmaking,
                    winger: player.winger,
                    passing: player.passing,
                    scoring: player.scoring,
                    setPieces: player.setPieces,
                    team: existingTeam._id
                });
                newPlayer.save();
                existingTeam.players.push(newPlayer);
            }
        }
        existingTeam.save();
        // console.log('This team already exists');
        // Update players and team solution to be done
    }
    else {
        // Create team
        const newTeam = new team_1.default({
            country: nationality,
            category: category
        });
        // Create players
        for (let player of team) {
            let newPlayer = new player_1.default({
                nationality: nationality,
                name: player.name,
                ht_id: player.ht_id,
                speciality: player.speciality,
                injury: player.injury,
                onTL: player.onTL,
                age_days: player.age_days,
                age_years: player.age_years,
                TSI: player.TSI,
                experience: player.experience,
                leadership: player.leadership,
                form: player.form,
                stamina: player.stamina,
                NTmatches: player.NTmatches,
                U21matches: player.U21matches,
                isInTeam: player.isInTeam,
                goalkeeping: player.goalkeeping,
                defending: player.defending,
                playmaking: player.playmaking,
                winger: player.winger,
                passing: player.passing,
                scoring: player.scoring,
                setPieces: player.setPieces,
                team: newTeam._id
            });
            // Store players and their reference into the team
            newTeam.players.push(newPlayer);
            yield newPlayer.save();
        }
        yield newTeam.save();
    }
});
exports.insertTeamIntoDb = insertTeamIntoDb;
