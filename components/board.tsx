"use client"
import clsx from "clsx";
import { useState, useReducer, useEffect, MouseEventHandler } from "react";
import { Modal, ModalBody, ModalFooter, LoadingOverlay } from '@/components/modal'

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
            // THIS IS SLOW
            // const storedState = localStorage.getItem('quixx-state');
            // if (storedState){
            //     return JSON.parse(storedState);   
            // }
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
            endLoadingState();
            const storedState = localStorage.getItem('quixx-state');
            if (storedState) {
                setBoardState(JSON.parse(storedState));
            }
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

    return (
        <div className="bg-slate-200 border md:border-2 lg:border-4 border-black border-solid rounded-xl w-full h-full px-3 py-2">
            {loadingState && <LoadingOverlay />}

            <p className="text-lg">
                <span className="text-slate-800 font-extrabold align-middle">QWIXX{'\u{2122}'} </span> <span className="text-slate-500 align-middle">GAMEWRIGHT</span>
                <button className="bg-black text-white m-1 w-6 h-6 p-1 rounded-full text-xs align-middle" onClick={() => setShowAboutModal(true)}>?</button>
                <button className="float-right bg-orange-300 border-orange-300 p-1 m-1 rounded-full text-xs align-middle" onClick={() => setShowResetModal(true)}>New Game</button>
                <button className="float-right bg-purple-300 border-purple-300 p-1 m-1 rounded-full text-xs align-middle" onClick={toggleScoreHidden}>Auto Score ({boardState.scoreHidden ? "OFF" : "ON"})</button>
            </p>

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
            <ResetModal isOpen={showResetModal} onConfirm={() => { resetBoard(); setShowResetModal(false) }} onCancel={() => setShowResetModal(false)} />
            <AboutModal isOpen={showAboutModal} onCancel={() => setShowAboutModal(false)} />
        </div>
    )
}

function ResetModal({ isOpen, onConfirm, onCancel }: { isOpen: boolean, onConfirm: MouseEventHandler, onCancel: MouseEventHandler }) {

    return (
        <Modal isOpen={isOpen}>
            <ModalBody icon={"\u{26A0}"} title="New Game?">
                Are you sure you want to start a new game? Your board will be permanently reset.
            </ModalBody>
            <ModalFooter>
                <button onClick={onConfirm} type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">Reset</button>
                <button onClick={onCancel} type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
            </ModalFooter>
        </Modal>
    );
}



function AboutModal({ isOpen, onCancel }: { isOpen: boolean, onCancel: MouseEventHandler }) {

    return (
        <Modal isOpen={isOpen}>
            <ModalBody icon={"\u{1F3B2}"} title="About Qwixx">
                <p>Qwixx{'\u{2122}'}  is a game published by Gamewright, played with 6 dice and a board for each player.
                    (<a target="_blank" href="https://www.ultraboardgames.com/qwixx/game-rules.php" className="hover:underline hover:decoration-1 hover:decoration-blue-400 text-blue-400">Read the rules here.</a>)
                </p>
                <p>
                    This app is a digital replacement for the original paper boards.
                    You can also use my <a target="_blank" href="https://matthew-h-wang.github.io/quixx-roller/" className="hover:underline hover:decoration-1 hover:decoration-blue-400 text-blue-400">dice-rolling utility</a>.
                </p>
            </ModalBody>
            <ModalFooter>
                <button onClick={onCancel} type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Close</button>
            </ModalFooter>
        </Modal>
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
        <div className={clsx(colorClasses, "whitespace-nowrap flex flex-nowrap justify-around space-x-1 h-14 w-full my-2 p-2")}>
            {nums.map((n, i) =>
                <Box key={i} disabled={isDisabled(i)} label={n} handleToggle={() => { if (!isDisabled(i)) toggleChecked(i) }} checked={checked[i]} />
            )}
            <LockBox key={"lock"} handleToggle={() => { if (!checked[final]) { toggleLocked() } else { toggleChecked(final) } }} locked={locked} checked={checked[final]} />
        </div>
    )
}



function Box({ label = "", checked = false, disabled = false, handleToggle = () => { } }: { label?: string, checked?: boolean, disabled?: boolean, handleToggle?: MouseEventHandler }) {
    return <span onClick={handleToggle} className={clsx("flex-auto text-3xl rounded w-12 h-full p-1 text-center select-none cursor-pointer",
        disabled || checked ? "bg-white/50" : "bg-white/90",
        checked ? "text-black font-bold" : "text-inherit",
        checked && !disabled && "ring-1 ring-white ring-offset-1 ring-offset-transparent"
    )}>
        {checked ? '\u{2717}' : label}
    </span>
}



function LockBox({ locked, checked, handleToggle }: { locked: boolean, checked: boolean, handleToggle: MouseEventHandler }) {
    return <span onClick={handleToggle} className={clsx("flex-auto text-xl flex-none rounded-full aspect-square h-full p-1 text-center select-none cursor-pointer",
        checked ? "text-black font-bold" : "text-inherit",
        checked || locked ? "bg-white/50 ring-1 ring-white ring-offset-1 ring-offset-transparent" : "bg-white/90",
    )}>
        {locked ? '\u{1F512}' : (checked ? '\u{2717}' : '\u{1F513}')}
    </span>
}


function PenaltyRow({ checked, toggleChecked }: { checked: boolean[], toggleChecked: (i: number) => void }) {

    return (
        <div className={clsx("whitespace-nowrap flex flex-nowrap items-center justify-center space-x-1 h-14 w-full my-2 p-2")}>
            <label className="text-lg">PENALTIES:</label>

            {checked.map((_, i) =>
                <Box key={i} handleToggle={() => { toggleChecked(i) }} checked={checked[i]} />
            )}
        </div>

    )
}


function ScoreRow({ redScore, yellowScore, greenScore, blueScore, penaltyScore }
    : { redScore: number, yellowScore: number, greenScore: number, blueScore: number, penaltyScore: number }) {

    return (
        <div className={clsx("whitespace-nowrap flex flex-nowrap items-center justify-center space-x-2 h-14 w-full my-2 p-2 text-xl")}>
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
        </div>


    )
}


function ScoreBox({ score, colorClasses }: { score: number, colorClasses: string }) {
    return <span className={clsx("flex-auto text-3xl rounded w-12 h-full p-1 text-center",
        colorClasses,
        "ring-2"
    )}>
        {score}
    </span>
}

function PointCountRow({ maxCount }: { maxCount: number }) {
    return (
        <div className={clsx("whitespace-nowrap flex flex-nowrap items-center justify-center space-x-2 h-14 w-full my-2 p-2 text-xl")}>

            {Array(maxCount).fill(null).map((_, i) =>
                <PointCountBox key={i} count={i + 1} />
            )}
        </div>
    );

}

function PointCountBox({ count }: { count: number }) {
    return <span className={clsx("flex-auto text-lg rounded w-12 h-fit p-1 text-center",
        "bg-slate-300 text-black",
    )}>
        <div>{count}X</div>
        <hr className="border-black" />
        <div>{count * (count + 1) / 2}</div>
    </span>
}
