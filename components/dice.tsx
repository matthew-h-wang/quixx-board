"use client"
import { Box, Button } from "@mui/material";
import clsx from "clsx";
import { useReducer, useState, useEffect } from "react";
import styles from './dice.module.css';
import {RowColor} from './board';

type DieColor = "white1"|"white2"|RowColor;
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

export default function Dice({lockedColors = new Set<DieColor>()} :{lockedColors: Set<DieColor>}) {

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
        setDiceState(rollDice(ALL_DICE_COLORS.filter((color:DieColor) => !lockedColors.has(color))));
        incrementRollCount();
    }

    return (
        <Box className="bg-slate-100 border border-black border-dashed rounded-xl w-full h-full my-2">
            <div className="flex flex-auto justify-left space-x-1 w-full items-center">
                <Box className="float-left mx-2">
                    <Button color="primary" variant="contained" onClick={reroll}  aria-label="roll" className="text-lg"
                        disabled={loadingState}>
                        Roll
                    </Button>
                </Box>
                <div className="grid grid-cols-3  grid-rows-2 grid-flow-col sm:grid-cols-6 sm:grid-rows-1 sm:grid-flow-row w-full place-items-center">

                    {diceState.map((die, i) => 
                        loadingState ? 
                            <DieSkeleton key={die.color + rollCount} {...die}/>
                        :
                            <Die key={die.color + rollCount} {...die}/> 
                    )}
                </div>
            </div>
        </Box>
    );
};

function DieSkeleton({color} : { color: DieColor}){
    return (

        <div role="status" className={clsx(DICE_COLORCLASS.get(color),"text-9xl sm:text-8xl select-none animate-pulse leading-[.75] sm:leading-[.75]")}> 
            {'\u{25FB}'}
        </div>

    )
}


function Die({face, color} : {face: DieFace, color: DieColor}){
    return (
        <div className={clsx(DICE_COLORCLASS.get(color),"text-9xl sm:text-8xl select-none leading-[.75] sm:leading-[.75]", styles.die)}>
            {DICE_UNICODE.get(face)}
        </div>
    )
}