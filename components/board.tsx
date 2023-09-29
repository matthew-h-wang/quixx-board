"use client"
import clsx from "clsx";
import { useState, useReducer, useEffect, MouseEventHandler } from "react";
import { Button, IconButton, Box, Divider,
        Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
        Link } from "@mui/material";
import HelpIcon from '@mui/icons-material/Help';
import RefreshIcon from '@mui/icons-material/Refresh';


type RowColor = 'red' | 'yellow' | 'blue' | 'green';
type RowState = { checked: boolean[], locked: boolean };
type BoardState = {
    red: RowState,
    yellow: RowState,
    green: RowState,
    blue: RowState,
    penaltyChecked: boolean[],
    scoreHidden: boolean
}

const ASCENDING: string[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const DESCENDING: string[] = ASCENDING.slice().reverse();

function getEmptyRowState() {
    return { checked: Array(ASCENDING.length).fill(false), locked: false }
}

function getRightmostChecked(checked: boolean[]): number {
    for (let i = checked.length - 1; i >= 0; i--) {
        if (checked[i])
            return i;
    }
    return -1;
}

function getCheckCount(checked: boolean[]): number {
    return checked.reduce((acc, current) => current ? acc + 1 : acc, 0);
}

function getRowScore(checked: boolean[]): number {
    const count = getCheckCount(checked) + (checked[checked.length - 1] ? 1 : 0);
    return count * (count + 1) / 2;
}

export default function Board() {

    const [boardState, setBoardState] = useState<BoardState>(
        () => {
            return {
                red: getEmptyRowState(),
                yellow: getEmptyRowState(),
                green: getEmptyRowState(),
                blue: getEmptyRowState(),
                penaltyChecked: Array(4).fill(false),
                scoreHidden: false
            }
        }
    );

    const [showResetModal, setShowResetModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [loadingState, endLoadingState] = useReducer(() => false, true);

    useEffect(() => {
        if (loadingState) {
            const storedState = localStorage.getItem('quixx-state');
            if (storedState) {
                setBoardState(JSON.parse(storedState));
            }
            endLoadingState();
            return;
        }

        localStorage.setItem('quixx-state', JSON.stringify(boardState));
    }, [boardState]);


    function toggleRowChecked(color: RowColor, index: number) {
        let updatedChecked = (boardState[color].checked).slice();
        updatedChecked[index] = !updatedChecked[index];
        setBoardState({
            ...boardState,
            [color]: { checked: updatedChecked, locked: boardState[color].locked }
        })
    }

    function togglePenaltyChecked(index: number) {
        let updatedChecked = (boardState.penaltyChecked).slice();
        updatedChecked[index] = !updatedChecked[index];
        setBoardState({
            ...boardState,
            penaltyChecked: updatedChecked
        }
        )
    };

    function toggleRowLocked(color: RowColor) {
        setBoardState({
            ...boardState,
            [color]: { checked: boardState[color].checked, locked: !boardState[color].locked }
        });
    }

    function toggleScoreHidden() {
        setBoardState({
            ...boardState,
            scoreHidden: !boardState.scoreHidden
        });

    }

    function resetBoard() {
        setBoardState(
            {
                red: getEmptyRowState(),
                yellow: getEmptyRowState(),
                green: getEmptyRowState(),
                blue: getEmptyRowState(),
                penaltyChecked: Array(4).fill(false),
                scoreHidden: boardState.scoreHidden
            }
        )
    }
    if (loadingState)
        return <BoardSkeleton/>
    return (
        <Box className="bg-slate-100 border md:border-2 lg:border-4 border-black border-solid rounded-xl w-full h-full px-3 py-2">

            <Box className="text-lg">
                <span className="text-slate-800 font-extrabold align-middle">QWIXX{'\u{2122}'} </span> <span className="text-slate-500 align-middle">GAMEWRIGHT</span>
                <IconButton onClick={() => setShowAboutModal(true)} color="primary">
                    <HelpIcon/>
                </IconButton>
                <IconButton className="float-right align-middle" color="error" onClick={() => setShowResetModal(true)}> 
                    <RefreshIcon/> 
                </IconButton>
                <Button disableElevation className="float-right" onClick={toggleScoreHidden}>Auto Score ({boardState.scoreHidden ? "OFF" : "ON"})</Button>
            </Box>

        
            <ColorRow colorClasses="bg-red-500 text-red-500" nums={ASCENDING} rowState={boardState.red} toggleChecked={(i: number) => toggleRowChecked('red', i)} toggleLocked={() => toggleRowLocked('red')} />
            <ColorRow colorClasses="bg-yellow-500 text-yellow-500" nums={ASCENDING} rowState={boardState.yellow} toggleChecked={(i: number) => toggleRowChecked('yellow', i)} toggleLocked={() => toggleRowLocked('yellow')} />
            <ColorRow colorClasses="bg-green-500 text-green-500" nums={DESCENDING} rowState={boardState.green} toggleChecked={(i: number) => toggleRowChecked('green', i)} toggleLocked={() => toggleRowLocked('green')} />
            <ColorRow colorClasses="bg-blue-500 text-blue-500" nums={DESCENDING} rowState={boardState.blue} toggleChecked={(i: number) => toggleRowChecked('blue', i)} toggleLocked={() => toggleRowLocked('blue')} />
            <PenaltyRow checked={boardState.penaltyChecked} toggleChecked={togglePenaltyChecked} />
            {boardState.scoreHidden ?
                <PointCountRow maxCount={ASCENDING.length + 1} />
                : <ScoreRow redScore={getRowScore(boardState.red.checked)}
                    yellowScore={getRowScore(boardState.yellow.checked)}
                    greenScore={getRowScore(boardState.green.checked)}
                    blueScore={getRowScore(boardState.blue.checked)}
                    penaltyScore={getCheckCount(boardState.penaltyChecked) * 5} />
            }
            <ResetModal isOpen={showResetModal} handleConfirm={() => { resetBoard(); setShowResetModal(false) }} handleCancel={() => setShowResetModal(false)} />
            <AboutModal isOpen={showAboutModal} handleClose={() => setShowAboutModal(false)} />
        </Box>
    )
}

function BoardSkeleton(){
    return (
        <Box className="bg-slate-100 border md:border-2 lg:border-4 border-black border-solid rounded-xl w-full h-full px-3 py-2">

            <Box className="text-lg">
                <span className="text-slate-800 font-extrabold align-middle">QWIXX{'\u{2122}'} </span> <span className="text-slate-500 align-middle">GAMEWRIGHT</span>
                <IconButton color="primary" disabled>
                    <HelpIcon/>
                </IconButton>
            </Box>

            <div role="status" className="w-full animate-pulse">
                <div className="bg-red-500 h-14 w-full my-2 p-2"></div>
                <div className="bg-yellow-500 h-14 w-full my-2 p-2"></div>
                <div className="bg-green-500 h-14 w-full my-2 p-2"></div>
                <div className="bg-blue-500 h-14 w-full my-2 p-2"></div>
                <div className="bg-slate-300 h-14 w-full my-2 p-2"></div>
                <div className="bg-slate-200 h-14 w-full my-2 p-2"></div>
            </div>
        </Box>
    );
}

function ResetModal({ isOpen, handleConfirm, handleCancel }: { isOpen: boolean, handleConfirm: MouseEventHandler, handleCancel: MouseEventHandler }) {

    return (
        <Dialog
            open={isOpen}
            onClose={handleCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
          {"Reset Board?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Are you sure you want to reset your board? Your game progress will be permanently lost.

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm} variant="contained" color="error" autoFocus>Reset</Button>
          <Button onClick={handleCancel} autoFocus>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
}



function AboutModal({ isOpen, handleClose }: { isOpen: boolean, handleClose: MouseEventHandler }) {

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
          {"About Qwixx"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Qwixx{'\u{2122}'}  is a game published by Gamewright, played with 6 dice and a board for each player.
          This app is a digital replacement for the original paper boards.
        <br/>
        <Link rel="noopener" target="_blank" href="https://www.ultraboardgames.com/qwixx/game-rules.php" underline="hover">Read the rules here.</Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>Close</Button>
        </DialogActions>
      </Dialog>

    );
}



function ColorRow({ rowState, toggleChecked, toggleLocked, colorClasses, nums }: { rowState: RowState, toggleChecked: (i: number) => void, toggleLocked: () => void, colorClasses: string, nums: string[] }) {
    const { checked, locked } = rowState;
    const checkCount = getCheckCount(checked);
    const final = checked.length - 1;
    const rightmostChecked = getRightmostChecked(checked);

    function isDisabled(index: number) {
        return locked || index < rightmostChecked || (index == final && checkCount < 5);
    }

    return (
        <Box className={clsx(colorClasses, "whitespace-nowrap flex flex-nowrap justify-around space-x-1 h-14 w-full my-2 p-2")}>
            {nums.map((n, i) =>
                <CheckBox key={i} disabled={isDisabled(i)} label={n} handleToggle={() => { if (!isDisabled(i)) toggleChecked(i) }} checked={checked[i]} />
            )}
            <LockBox key={"lock"} handleToggle={() => { if (!checked[final]) { toggleLocked() } else { toggleChecked(final) } }} locked={locked} checked={checked[final]} />
        </Box>
    )
}



function CheckBox({ label = "", checked = false, disabled = false, handleToggle = () => { } }: { label?: string, checked?: boolean, disabled?: boolean, handleToggle?: MouseEventHandler }) {
    return <Box onClick={handleToggle} className={clsx("flex-auto text-3xl rounded w-12 h-full p-1 text-center select-none cursor-pointer",
        disabled || checked ? "bg-white/50" : "bg-white/90",
        checked ? "text-black font-bold" : "text-inherit",
        checked && !disabled && "ring-1 ring-white ring-offset-1 ring-offset-transparent"
    )}>
        {checked ? '\u{2717}' : label}
    </Box>
}



function LockBox({ locked, checked, handleToggle }: { locked: boolean, checked: boolean, handleToggle: MouseEventHandler }) {
    return <Box onClick={handleToggle} className={clsx("flex-auto text-xl flex-none rounded-full aspect-square h-full p-1 text-center select-none cursor-pointer",
        checked ? "text-black font-bold" : "text-inherit",
        checked || locked ? "bg-white/50 ring-1 ring-white ring-offset-1 ring-offset-transparent" : "bg-white/90",
    )}>
        {locked ? '\u{1F512}' : (checked ? '\u{2717}' : '\u{1F513}')}
    </Box>
}


function PenaltyRow({ checked, toggleChecked }: { checked: boolean[], toggleChecked: (i: number) => void }) {

    return (
        <Box className={clsx("whitespace-nowrap flex flex-nowrap items-center justify-center space-x-1 h-14 w-full my-2 p-2")}>
            <label className="text-lg">PENALTIES:</label>

            {checked.map((_, i) =>
                <CheckBox key={i} handleToggle={() => { toggleChecked(i) }} checked={checked[i]} />
            )}
        </Box>

    )
}


function ScoreRow({ redScore, yellowScore, greenScore, blueScore, penaltyScore }
    : { redScore: number, yellowScore: number, greenScore: number, blueScore: number, penaltyScore: number }) {

    return (
        <Box className={clsx("whitespace-nowrap flex flex-nowrap items-center justify-center space-x-2 h-14 w-full my-2 p-2 text-xl")}>
            <label className="text-lg">TOTALS:</label>
            <ScoreBox score={redScore} colorClasses="bg-red-500/20 text-red-500 ring-red-500" />
            <span>+</span>
            <ScoreBox score={yellowScore} colorClasses="bg-yellow-500/20 text-yellow-500 ring-yellow-500" />
            <span>+</span>
            <ScoreBox score={greenScore} colorClasses="bg-green-500/20 text-green-500 ring-green-500" />
            <span>+</span>
            <ScoreBox score={blueScore} colorClasses="bg-blue-500/20 text-blue-500 ring-blue-500" />
            <span>-</span>
            <ScoreBox score={penaltyScore} colorClasses="bg-slate-200/20 text-slate-500 ring-slate-500" />
            <span>=</span>
            <ScoreBox score={redScore + yellowScore + greenScore + blueScore - penaltyScore}
                colorClasses="bg-white/50 text-black ring-black" />
        </Box>


    )
}


function ScoreBox({ score, colorClasses }: { score: number, colorClasses: string }) {
    return <Box className={clsx("flex-auto text-3xl rounded w-12 h-full p-1 text-center",
        colorClasses,
        "ring-2"
    )}>
        {score}
    </Box>
}

function PointCountRow({ maxCount }: { maxCount: number }) {
    return (
        <Box className={clsx("whitespace-nowrap flex flex-nowrap items-center justify-center space-x-2 h-14 w-full my-4 p-2 text-xl")}>

            {Array(maxCount).fill(null).map((_, i) =>
                <PointCountBox key={i} count={i + 1} />
            )}
        </Box>
    );

}

function PointCountBox({ count }: { count: number }) {
    return <span className={clsx("flex-auto text-lg rounded w-12 h-fit p-1 text-center",
        "bg-slate-300 text-black",
    )}>
        {count}X
        <Divider className="border-black"/>
        {count * (count + 1) / 2}
    </span>
}
