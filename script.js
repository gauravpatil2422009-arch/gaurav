/* =========================================================
   GAURAV — CINEMATIC INTRO
   ---------------------------------------------------------
   FINAL INTRO FLOW

   1. Black screen
   2. Small lamp + short rope
   3. PULL ME
   4. Pull rope
   5. Lamp turns ON
   6. GAURAV glows #f9d1d9
   7. GAURAV remains visible for 7 seconds
   8. Power-cut / glitch effect
   9. GAURAV disappears
   10. PULL ME appears again
   11. Pull rope
   12. START glows #feffaf
   13. Click directly on START
   14. Portfolio opens

   Everything else remains cinematic and minimal.
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const canvas =
    document.getElementById("introCanvas");

const ctx =
    canvas.getContext("2d");

const intro =
    document.getElementById("intro");

const pullInstruction =
    document.getElementById("introInstruction");

const tiltInstruction =
    document.getElementById("tiltInstruction");

const secondPullInstruction =
    document.getElementById("secondPullInstruction");

const startButton =
    document.getElementById("startButton");

const portfolio =
    document.getElementById("portfolio");

const introFlash =
    document.getElementById("introFlash");


/*
   We don't use the HTML START button anymore.

   START is drawn directly on canvas and
   the glowing word itself becomes clickable.
*/

if (startButton) {

    startButton.style.opacity = "0";
    startButton.style.pointerEvents = "none";
}


/* =========================================================
   CANVAS
========================================================= */

let width = 0;
let height = 0;
let dpr = 1;


function resizeCanvas() {

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width =
        window.innerWidth;

    height =
        window.innerHeight;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    setupLamp();
    createLetters();
}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   STATES
========================================================= */

const STATE = {

    WAITING_FOR_FIRST_PULL:
        "waitingFirstPull",

    LAMP_ON:
        "lampOn",

    GAURAV:
        "gaurav",

    GLITCH:
        "glitch",

    WAITING_FOR_SECOND_PULL:
        "waitingSecondPull",

    START:
        "start",

    FINISHED:
        "finished"
};


let state =
    STATE.WAITING_FOR_FIRST_PULL;


/* =========================================================
   TIME
========================================================= */

let lastTime =
    performance.now();

let elapsed =
    0;


/* =========================================================
   LAMP
========================================================= */

const lamp = {

    x: 0,

    y: 0,

    shadeWidth: 0,

    shadeHeight: 0,

    lightRadius: 0,

    brightness: 0,

    targetBrightness: 0,

    ropeTopX: 0,

    ropeTopY: 0,

    ropeLength: 0,

    ropePull: 0,

    ropeVelocity: 0,

    isDragging: false,

    pullStartY: 0
};


/* =========================================================
   ROPE PHYSICS
========================================================= */

const ropePhysics = {

    maxPull: 0,

    spring: 0.065,

    damping: 0.78
};


/* =========================================================
   GAURAV
========================================================= */

const word =
    "GAURAV";


let letters = [];


/*
   GAURAV visual state
*/

let gauravOpacity = 0;

let gauravGlow = 0;

let gauravVisible = false;


/* =========================================================
   GLITCH SYSTEM
========================================================= */

const glitch = {

    active: false,

    startTime: 0,

    duration: 1650,

    intensity: 0,

    powerCut: 0,

    finished: false
};


/*
   Random glitch bars.
*/

let glitchBars = [];


/* =========================================================
   START
========================================================= */

const startText = {

    x: 0,

    y: 0,

    opacity: 0,

    glow: 0,

    scale: 0.92,

    visible: false,

    hitRadiusX: 0,

    hitRadiusY: 0
};


/* =========================================================
   POINTER
========================================================= */

let currentPointerY = 0;


/* =========================================================
   HELPERS
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


function lerp(
    a,
    b,
    amount
) {

    return (
        a +
        (b - a) *
        amount
    );
}


function random(
    min,
    max
) {

    return (
        Math.random() *
        (max - min) +
        min
    );
}


/* =========================================================
   LAMP SETUP
========================================================= */

function setupLamp() {

    /*
       SMALL AESTHETIC LAMP
    */

    const scale =
        clamp(
            Math.min(
                width,
                height
            ) / 700,
            0.75,
            1.2
        );


    lamp.shadeWidth =
        92 * scale;


    lamp.shadeHeight =
        43 * scale;


    lamp.x =
        width * 0.5;


    lamp.y =
        height * 0.18;


    lamp.lightRadius =
        Math.min(
            width,
            height
        ) * 0.52;


    lamp.ropeTopX =
        lamp.x;


    lamp.ropeTopY =
        lamp.y +
        lamp.shadeHeight *
        0.78;


    /*
       SHORT ROPE
    */

    lamp.ropeLength =
        clamp(
            height * 0.11,
            65,
            105
        );


    ropePhysics.maxPull =
        lamp.ropeLength *
        0.34;
}


/* =========================================================
   CREATE GAURAV LETTERS
========================================================= */

function createLetters() {

    letters = [];


    const fontSize =
        clamp(
            Math.min(
                width,
                height
            ) * 0.105,
            54,
            120
        );


    ctx.font =
        `300 ${fontSize}px Arial`;


    const spacing =
        fontSize *
        0.055;


    let totalWidth =
        0;


    const measurements = [];


    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        const letterWidth =
            ctx.measureText(
                word[i]
            ).width;


        measurements.push(
            letterWidth
        );


        totalWidth +=
            letterWidth;


        if (
            i <
            word.length - 1
        ) {

            totalWidth +=
                spacing;
        }
    }


    let currentX =
        width / 2 -
        totalWidth / 2;


    const centerY =
        height * 0.52;


    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        const letterWidth =
            measurements[i];


        letters.push({

            char:
                word[i],

            x:
                currentX +
                letterWidth / 2,

            y:
                centerY,

            fontSize:
                fontSize,

            opacity:
                0,

            glow:
                0,

            flicker:
                1
        });


        currentX +=
            letterWidth +
            spacing;
    }
}


/* =========================================================
   DRAW LAMP LIGHT
========================================================= */

function drawLampLight() {

    if (
        lamp.brightness <=
        0.001
    ) {

        return;
    }


    const gradient =
        ctx.createRadialGradient(

            lamp.x,

            lamp.y +
                lamp.shadeHeight *
                0.8,

            0,

            lamp.x,

            lamp.y +
                lamp.shadeHeight *
                0.8,

            lamp.lightRadius
        );


    const brightness =
        lamp.brightness;


    gradient.addColorStop(
        0,
        `rgba(255,244,210,${0.20 * brightness})`
    );


    gradient.addColorStop(
        0.12,
        `rgba(255,235,190,${0.12 * brightness})`
    );


    gradient.addColorStop(
        0.35,
        `rgba(255,220,170,${0.055 * brightness})`
    );


    gradient.addColorStop(
        0.7,
        `rgba(255,210,160,${0.015 * brightness})`
    );


    gradient.addColorStop(
        1,
        "rgba(255,200,150,0)"
    );


    ctx.save();

    ctx.globalCompositeOperation =
        "screen";


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.restore();
}


/* =========================================================
   DRAW LAMP
========================================================= */

function drawLamp() {

    const x =
        lamp.x;

    const y =
        lamp.y;

    const sw =
        lamp.shadeWidth;

    const sh =
        lamp.shadeHeight;


    ctx.save();


    /*
       Ceiling point
    */

    ctx.fillStyle =
        "#151515";


    ctx.beginPath();

    ctx.arc(
        x,
        y - 11,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Cable
    */

    ctx.strokeStyle =
        "rgba(130,130,130,0.4)";

    ctx.lineWidth =
        1;


    ctx.beginPath();

    ctx.moveTo(
        x,
        y - 10
    );

    ctx.lineTo(
        x,
        y
    );

    ctx.stroke();


    /*
       Soft lamp glow
    */

    if (
        lamp.brightness >
        0.01
    ) {

        const glow =
            ctx.createRadialGradient(

                x,

                y +
                    sh *
                    0.45,

                0,

                x,

                y +
                    sh *
                    0.45,

                sw
            );


        glow.addColorStop(
            0,
            `rgba(255,235,190,${0.4 * lamp.brightness})`
        );


        glow.addColorStop(
            0.5,
            `rgba(255,215,160,${0.12 * lamp.brightness})`
        );


        glow.addColorStop(
            1,
            "rgba(255,200,150,0)"
        );


        ctx.fillStyle =
            glow;


        ctx.beginPath();

        ctx.arc(
            x,
            y + sh * 0.45,
            sw,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /*
       Lamp shade
    */

    ctx.beginPath();


    ctx.moveTo(
        x - sw / 2,
        y
    );


    ctx.quadraticCurveTo(
        x - sw * 0.43,
        y + sh * 0.65,
        x - sw * 0.30,
        y + sh
    );


    ctx.lineTo(
        x + sw * 0.30,
        y + sh
    );


    ctx.quadraticCurveTo(
        x + sw * 0.43,
        y + sh * 0.65,
        x + sw / 2,
        y
    );


    ctx.closePath();


    const shade =
        ctx.createLinearGradient(
            x,
            y,
            x,
            y + sh
        );


    shade.addColorStop(
        0,
        "#1c1c1c"
    );


    shade.addColorStop(
        0.6,
        "#0e0e0e"
    );


    shade.addColorStop(
        1,
        lamp.brightness > 0.05
            ? "#3b2d21"
            : "#080808"
    );


    ctx.fillStyle =
        shade;


    ctx.fill();


    /*
       Bottom light
    */

    ctx.beginPath();


    ctx.ellipse(
        x,
        y + sh,
        sw * 0.31,
        4,
        0,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        lamp.brightness >
        0.05

            ? `rgba(255,231,183,${0.65 * lamp.brightness})`

            : "#111";


    ctx.fill();


    ctx.restore();
}


/* =========================================================
   DRAW ROPE
========================================================= */

function drawRope() {

    const x =
        lamp.ropeTopX;

    const startY =
        lamp.ropeTopY;

    const length =
        lamp.ropeLength;

    const pull =
        lamp.ropePull;


    const endY =
        startY +
        length +
        pull;


    const curve =
        Math.sin(
            elapsed * 2.3
        ) * 1.3;


    ctx.save();


    /*
       Rope
    */

    ctx.strokeStyle =
        "rgba(160,160,160,0.72)";


    ctx.lineWidth =
        1.3;


    ctx.beginPath();


    ctx.moveTo(
        x,
        startY
    );


    ctx.bezierCurveTo(
        x + curve,
        startY +
            length *
            0.33,

        x - curve,
        startY +
            length *
            0.70,

        x,
        endY
    );


    ctx.stroke();


    /*
       Pull knob
    */

    const knob =
        ctx.createRadialGradient(
            x - 1,
            endY - 1,
            0,
            x,
            endY,
            5
        );


    knob.addColorStop(
        0,
        "#e4e4e4"
    );


    knob.addColorStop(
        0.5,
        "#777"
    );


    knob.addColorStop(
        1,
        "#303030"
    );


    ctx.fillStyle =
        knob;


    ctx.beginPath();


    ctx.arc(
        x,
        endY,
        4.5,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();
}


/* =========================================================
   ROPE HIT TEST
========================================================= */

function isPointerOnRope(
    x,
    y
) {

    const ropeX =
        lamp.ropeTopX;

    const top =
        lamp.ropeTopY;

    const bottom =
        top +
        lamp.ropeLength +
        lamp.ropePull;


    return (

        Math.abs(
            x - ropeX
        ) < 30 &&

        y >=
            top - 15 &&

        y <=
            bottom + 20
    );
}


/* =========================================================
   BEGIN ROPE PULL
========================================================= */

function beginRopePull(
    pointerY
) {

    if (

        state !==
            STATE.WAITING_FOR_FIRST_PULL &&

        state !==
            STATE.WAITING_FOR_SECOND_PULL
    ) {

        return;
    }


    lamp.isDragging =
        true;


    lamp.pullStartY =
        pointerY;
}


/* =========================================================
   RELEASE ROPE
========================================================= */

function releaseRope() {

    if (
        !lamp.isDragging
    ) {

        return;
    }


    lamp.isDragging =
        false;


    if (

        lamp.ropePull >
        ropePhysics.maxPull *
        0.40
    ) {

        triggerLamp();
    }
}


/* =========================================================
   UPDATE ROPE
========================================================= */

function updateRope() {

    if (
        lamp.isDragging
    ) {

        const desiredPull =
            clamp(

                currentPointerY -
                    lamp.pullStartY,

                0,

                ropePhysics.maxPull
            );


        lamp.ropePull =
            lerp(
                lamp.ropePull,
                desiredPull,
                0.35
            );

    } else {

        /*
           Smooth elastic return.
        */

        const force =
            -lamp.ropePull *
            ropePhysics.spring;


        lamp.ropeVelocity +=
            force;


        lamp.ropeVelocity *=
            ropePhysics.damping;


        lamp.ropePull +=
            lamp.ropeVelocity;


        if (

            Math.abs(
                lamp.ropePull
            ) < 0.05
        ) {

            lamp.ropePull =
                0;

            lamp.ropeVelocity =
                0;
        }
    }
}


/* =========================================================
   FIRST / SECOND PULL
========================================================= */

function triggerLamp() {

    if (

        state !==
            STATE.WAITING_FOR_FIRST_PULL &&

        state !==
            STATE.WAITING_FOR_SECOND_PULL
    ) {

        return;
    }


    /*
       Rope snap-back.
    */

    lamp.ropeVelocity =
        -0.035;


    /* =====================================================
       FIRST PULL
    ====================================================== */

    if (
        state ===
        STATE.WAITING_FOR_FIRST_PULL
    ) {

        state =
            STATE.LAMP_ON;


        lamp.targetBrightness =
            1;


        hide(
            pullInstruction
        );


        cinematicFlash();


        /*
           GAURAV begins appearing.
        */

        setTimeout(
            () => {

                showGaurav();

            },
            450
        );


        /*
           IMPORTANT:

           After GAURAV has appeared,
           wait approximately 7 seconds
           before the power-cut effect.
        */

        setTimeout(
            () => {

                beginPowerCut();

            },
            7600
        );


    }


    /* =====================================================
       SECOND PULL
    ====================================================== */

    else {

        state =
            STATE.START;


        hide(
            secondPullInstruction
        );


        /*
           START appears.
        */

        setTimeout(
            () => {

                showStart();

            },
            400
        );
    }
}


/* =========================================================
   GAURAV APPEAR
========================================================= */

function showGaurav() {

    state =
        STATE.GAURAV;


    gauravVisible =
        true;


    /*
       Fade letters in individually,
       but very subtly.
    */

    letters.forEach(
        (
            letter,
            index
        ) => {

            setTimeout(
                () => {

                    letter.opacity =
                        1;

                    letter.glow =
                        1;

                },
                index * 100
            );
        }
    );
}


/* =========================================================
   DRAW GAURAV
========================================================= */

function drawGaurav() {

    if (
        !gauravVisible
    ) {

        return;
    }


    ctx.save();


    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    for (
        let i = 0;
        i < letters.length;
        i++
    ) {

        const letter =
            letters[i];


        if (
            letter.opacity <=
            0.01
        ) {

            continue;
        }


        /*
           Normal glow before
           power cut.
        */

        let glowStrength =
            letter.glow;


        /*
           During glitch,
           individual letters flicker.
        */

        if (
            glitch.active
        ) {

            const flicker =
                Math.random();


            if (
                flicker < 0.18
            ) {

                letter.flicker =
                    0;

            } else {

                letter.flicker =
                    1;
            }


            glowStrength *=
                letter.flicker;
        }


        ctx.save();


        ctx.translate(
            letter.x,
            letter.y
        );


        ctx.font =
            `300 ${letter.fontSize}px Arial`;


        /*
           Pink glow.
        */

        ctx.shadowColor =
            `rgba(
                249,
                209,
                217,
                ${0.65 * glowStrength}
            )`;


        ctx.shadowBlur =
            22;


        ctx.fillStyle =
            `rgba(
                249,
                209,
                217,
                ${letter.opacity * letter.flicker}
            )`;


        ctx.fillText(
            letter.char,
            0,
            0
        );


        /*
           Glitch copies.

           These create the brief
           electronic/power-cut feeling.
        */

        if (
            glitch.active
        ) {

            const glitchAmount =
                glitch.intensity;


            if (
                Math.random() <
                0.42
            ) {

                ctx.shadowBlur =
                    0;


                ctx.fillStyle =
                    `rgba(
                        255,
                        120,
                        150,
                        ${0.30 * glitchAmount}
                    )`;


                ctx.fillText(
                    letter.char,
                    random(
                        -7,
                        7
                    ),
                    random(
                        -2,
                        2
                    )
                );
            }


            if (
                Math.random() <
                0.35
            ) {

                ctx.fillStyle =
                    `rgba(
                        255,
                        255,
                        255,
                        ${0.22 * glitchAmount}
                    )`;


                ctx.fillText(
                    letter.char,
                    random(
                        -4,
                        4
                    ),
                    random(
                        -5,
                        5
                    )
                );
            }
        }


        ctx.restore();
    }


    ctx.restore();
}


/* =========================================================
   POWER CUT
========================================================= */

function beginPowerCut() {

    if (
        state !==
        STATE.GAURAV
    ) {

        return;
    }


    state =
        STATE.GLITCH;


    glitch.active =
        true;


    glitch.finished =
        false;


    glitch.startTime =
        performance.now();


    /*
       Generate glitch bars.
    */

    glitchBars =
        [];


    for (
        let i = 0;
        i < 24;
        i++
    ) {

        glitchBars.push({

            y:
                random(
                    height * 0.32,
                    height * 0.68
                ),

            height:
                random(
                    1,
                    5
                ),

            width:
                random(
                    width * 0.08,
                    width * 0.65
                ),

            x:
                random(
                    -50,
                    width
                ),

            speed:
                random(
                    2,
                    9
                ),

            opacity:
                random(
                    0.08,
                    0.35
                )
        });
    }


    /*
       The actual power cut
       happens toward the end.
    */

    setTimeout(
        () => {

            gauravVisible =
                false;


            letters.forEach(
                letter => {

                    letter.opacity =
                        0;

                }
            );


        },
        1150
    );


    /*
       After glitch finishes,
       PULL ME returns.
    */

    setTimeout(
        () => {

            finishPowerCut();

        },
        glitch.duration
    );
}


/* =========================================================
   UPDATE GLITCH
========================================================= */

function updateGlitch() {

    if (
        !glitch.active
    ) {

        return;
    }


    const elapsedGlitch =
        performance.now() -
        glitch.startTime;


    const progress =
        clamp(
            elapsedGlitch /
                glitch.duration,
            0,
            1
        );


    /*
       Strongest glitch
       around middle.
    */

    glitch.intensity =
        Math.sin(
            progress *
            Math.PI
        );


    /*
       Power flicker.
    */

    if (
        Math.random() <
        0.035
    ) {

        glitch.powerCut =
            1;

    } else {

        glitch.powerCut =
            lerp(
                glitch.powerCut,
                0,
                0.25
            );
    }


    /*
       Move glitch bars.
    */

    glitchBars.forEach(
        bar => {

            bar.x +=
                bar.speed;


            if (
                bar.x >
                width + bar.width
            ) {

                bar.x =
                    -bar.width;
            }
        }
    );
}


/* =========================================================
   DRAW GLITCH
========================================================= */

function drawGlitch() {

    if (
        !glitch.active
    ) {

        return;
    }


    /*
       Horizontal digital fragments.
    */

    ctx.save();


    for (
        const bar of glitchBars
    ) {

        if (
            Math.random() >
            glitch.intensity *
            0.7
        ) {

            continue;
        }


        ctx.fillStyle =
            `rgba(
                249,
                209,
                217,
                ${bar.opacity * glitch.intensity}
            )`;


        ctx.fillRect(
            bar.x,
            bar.y,
            bar.width,
            bar.height
        );
    }


    /*
       Very subtle screen interruption.
    */

    if (
        glitch.powerCut >
        0.2
    ) {

        ctx.fillStyle =
            `rgba(
                255,
                255,
                255,
                ${0.025 * glitch.powerCut}
            )`;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );
    }


    ctx.restore();
}


/* =========================================================
   FINISH POWER CUT
========================================================= */

function finishPowerCut() {

    glitch.active =
        false;


    glitch.intensity =
        0;


    gauravVisible =
        false;


    /*
       Second PULL ME.
    */

    state =
        STATE.WAITING_FOR_SECOND_PULL;


    setTimeout(
        () => {

            show(
                secondPullInstruction
            );

        },
        250
    );
}


/* =========================================================
   START
========================================================= */

function showStart() {

    startText.visible =
        true;


    startText.x =
        width / 2;


    startText.y =
        height / 2;


    startText.opacity =
        0;


    startText.glow =
        0;


    startText.scale =
        0.92;
}


/* =========================================================
   UPDATE START
========================================================= */

function updateStart() {

    if (
        !startText.visible
    ) {

        return;
    }


    startText.opacity =
        lerp(
            startText.opacity,
            1,
            0.045
        );


    startText.glow =
        lerp(
            startText.glow,
            1,
            0.045
        );


    startText.scale =
        lerp(
            startText.scale,
            1,
            0.045
        );


    /*
       Small breathing glow.
    */

    const pulse =
        1 +
        Math.sin(
            elapsed * 2
        ) *
        0.035;


    startText.scale *=
        pulse;
}


/* =========================================================
   DRAW START
========================================================= */

function drawStart() {

    if (
        !startText.visible
    ) {

        return;
    }


    ctx.save();


    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.translate(
        startText.x,
        startText.y
    );


    ctx.scale(
        startText.scale,
        startText.scale
    );


    /*
       Exact requested color:
       #feffaf
    */

    ctx.font =
        `300 ${clamp(
            Math.min(
                width,
                height
            ) * 0.065,
            30,
            68
        )}px Arial`;


    /*
       Soft yellow glow.
    */

    ctx.shadowColor =
        `rgba(
            254,
            255,
            175,
            ${0.75 * startText.glow}
        )`;


    ctx.shadowBlur =
        28;


    ctx.fillStyle =
        `rgba(
            254,
            255,
            175,
            ${startText.opacity}
        )`;


    ctx.fillText(
        "START",
        0,
        0
    );


    /*
       Store clickable region.
    */

    const metrics =
        ctx.measureText(
            "START"
        );


    startText.hitRadiusX =
        metrics.width / 2 +
        25;


    startText.hitRadiusY =
        45;


    ctx.restore();
}


/* =========================================================
   START HIT TEST
========================================================= */

function isOnStart(
    x,
    y
) {

    if (
        !startText.visible
    ) {

        return false;
    }


    return (

        Math.abs(
            x -
            startText.x
        ) <=
        startText.hitRadiusX &&

        Math.abs(
            y -
            startText.y
        ) <=
        startText.hitRadiusY
    );
}


/* =========================================================
   OPEN PORTFOLIO
========================================================= */

function openPortfolio() {

    if (
        state !==
        STATE.START
    ) {

        return;
    }


    state =
        STATE.FINISHED;


    startText.visible =
        false;


    cinematicFlash();


    setTimeout(
        () => {

            portfolio.classList.add(
                "visible"
            );

        },
        350
    );


    setTimeout(
        () => {

            intro.classList.add(
                "finished"
            );


            document.body.style.overflow =
                "auto";

        },
        1400
    );
}


/* =========================================================
   CANVAS POINTER
========================================================= */

canvas.addEventListener(
    "pointerdown",
    event => {

        currentPointerY =
            event.clientY;


        /*
           START itself is clickable.
        */

        if (
            state ===
            STATE.START
        ) {

            if (
                isOnStart(
                    event.clientX,
                    event.clientY
                )
            ) {

                openPortfolio();
            }


            return;
        }


        /*
           ROPE
        */

        if (

            state ===
                STATE.WAITING_FOR_FIRST_PULL ||

            state ===
                STATE.WAITING_FOR_SECOND_PULL
        ) {

            if (
                isPointerOnRope(
                    event.clientX,
                    event.clientY
                )
            ) {

                beginRopePull(
                    event.clientY
                );


                try {

                    canvas.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {}
            }
        }
    }
);


/* =========================================================
   POINTER MOVE
========================================================= */

canvas.addEventListener(
    "pointermove",
    event => {

        currentPointerY =
            event.clientY;
    }
);


/* =========================================================
   POINTER UP
========================================================= */

canvas.addEventListener(
    "pointerup",
    event => {

        currentPointerY =
            event.clientY;


        releaseRope();
    }
);


canvas.addEventListener(
    "pointercancel",
    () => {

        releaseRope();
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.code !==
            "Space"
        ) {

            return;
        }


        if (

            state ===
                STATE.WAITING_FOR_FIRST_PULL ||

            state ===
                STATE.WAITING_FOR_SECOND_PULL
        ) {

            event.preventDefault();


            lamp.isDragging =
                true;


            lamp.ropePull =
                ropePhysics.maxPull *
                0.8;


            setTimeout(
                () => {

                    releaseRope();

                },
                100
            );
        }
    }
);


/* =========================================================
   SHOW / HIDE
========================================================= */

function show(
    element
) {

    element.classList.remove(
        "hidden"
    );

    element.classList.add(
        "visible"
    );
}


function hide(
    element
) {

    element.classList.remove(
        "visible"
    );

    element.classList.add(
        "hidden"
    );
}


/* =========================================================
   FLASH
========================================================= */

function cinematicFlash() {

    introFlash.classList.add(
        "active"
    );


    setTimeout(
        () => {

            introFlash.classList.remove(
                "active"
            );

        },
        180
    );
}


/* =========================================================
   UPDATE LAMP
========================================================= */

function updateLamp() {

    lamp.brightness =
        lerp(
            lamp.brightness,
            lamp.targetBrightness,
            0.035
        );
}


/* =========================================================
   MAIN UPDATE
========================================================= */

function update(
    delta
) {

    elapsed +=
        delta / 1000;


    updateLamp();


    updateRope();


    updateGlitch();


    updateStart();
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    /*
       BLACK BACKGROUND
    */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        "#000";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Lamp light
    */

    drawLampLight();


    /*
       Lamp
    */

    drawLamp();


    /*
       Rope
    */

    drawRope();


    /*
       GAURAV
    */

    drawGaurav();


    /*
       Glitch
    */

    drawGlitch();


    /*
       START
    */

    drawStart();
}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animationLoop(
    now
) {

    const delta =
        Math.min(
            now -
            lastTime,
            32
        );


    lastTime =
        now;


    update(
        delta
    );


    draw();


    requestAnimationFrame(
        animationLoop
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    document.body.style.overflow =
        "hidden";


    /*
       First PULL ME
    */

    show(
        pullInstruction
    );


    /*
       Hide tilt instruction because
       this version no longer needs
       the tilt phase after GAURAV.
    */

    hide(
        tiltInstruction
    );


    hide(
        secondPullInstruction
    );


    /*
       Hide old HTML START button.
    */

    if (startButton) {

        startButton.style.display =
            "none";
    }


    resizeCanvas();


    requestAnimationFrame(
        animationLoop
    );
}


initialize();