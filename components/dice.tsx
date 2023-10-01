"use client"
import { Box, Button } from "@mui/material";
import clsx from "clsx";
import { useReducer, useState, useEffect } from "react";
import styles from './dice.module.css';

type DieColor = "white1"|"white2"|"red"|"yellow"|"blue"|"green";
type DieFace = 1|2|3|4|5|6;
type DieRoll = {face: DieFace, color: DieColor};

const DICE_UNICODE : Map<DieFace, string> = new Map([
    [1,'\u{2680}'],
    [2,'\u{2681}'],
    [3,'\u{2682}'],
    [4,'\u{2683}'],
    [5,'\u{2684}'],
    [6,'\u{2685}'],
])

const DICE_COLORCLASS : Map<DieColor, string> = new Map([
    ["white1",'text-white-500'],
    ["white2",'text-white-500'],
    ["red",'text-red-500'],
    ["yellow",'text-yellow-500'],
    ["green",'text-green-500'],
    ["blue",'text-blue-500'],
])

const ALL_DICE_COLORS : DieColor[] =["white1","white2","red","yellow","blue","green"]

export function rollDice(colors: DieColor[] ) : DieRoll[] {
    return colors.map((color, ) => {
        return {face: (Math.floor(Math.random() * 6 + 1) as DieFace), color}
    });
}

export default function Dice() {

    const [diceState, setDiceState] = useState<DieRoll[]>(ALL_DICE_COLORS.map((color, i) => {return {color, face: i + 1 as DieFace}}));
    const [rollCount, incrementRollCount] = useReducer((n : number) => n + 1, 0);

    const [loadingState, endLoadingState] = useReducer(() => false, true);

    
    useEffect(() => {
        if (loadingState) {
            const storedState = localStorage.getItem('quixx-dice');
            if (storedState) {
                setDiceState(JSON.parse(storedState));
            }
            endLoadingState();
            return;
        }

        localStorage.setItem('quixx-dice', JSON.stringify(diceState));
    }, [diceState]);

    function reroll(){
        setDiceState(rollDice(ALL_DICE_COLORS));
        incrementRollCount();
    }

    return (
        <Box className="bg-slate-100 border border-black border-dashed rounded-xl w-full h-full my-2">
            {/* <Button variant="contained">Roll Dice</Button> */}
            <div className="flex flex-auto justify-around space-x-1 w-full items-center">

            <Button color="primary" variant="contained" onClick={reroll}  aria-label="roll" className="float-left text-lg mx-2"
                disabled={loadingState}>
                Roll {'\u{1F3B2}'}
            </Button>
            {diceState.map((die, i) => 
                loadingState ? 
                    <DieSkeleton key={die.color + rollCount} {...die}/>
                :
                    <Die key={die.color + rollCount} {...die}/> 
            )}
            </div>
        </Box>
    );
};

function DieSkeleton({color} : { color: DieColor}){
    return (

        <div role="status" className={clsx(DICE_COLORCLASS.get(color),"text-8xl select-none animate-pulse flex-auto")}> 
            {'\u{25FB}'}
        </div>

    )
}


function Die({face, color} : {face: DieFace, color: DieColor}){
    return (
        <div className={clsx(DICE_COLORCLASS.get(color),"text-8xl select-none flex-auto", styles.die)}>
            {DICE_UNICODE.get(face)}
        </div>
    )
}