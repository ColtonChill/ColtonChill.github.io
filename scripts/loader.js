let Game = {
    screens : {},
    controlMap: {fire:'', left:'', right:''},
    assets: {}
};

//------------------------------------------------------------------
//
// Purpose of this code is to bootstrap (maybe I should use that as the name)
// the rest of the application.  Only this file is specified in the index.html
// file, then the code in this file gets all the other code and assets
// loaded.
//
//------------------------------------------------------------------
Game.loader = (function() {
    'use strict';
    let scriptOrder = [{
            scripts: ['util', 'sound', 'controls/input'],
            message: 'utils loaded',
            onComplete: null
        }, {
            scripts: ['render/graphics', 'render/particleSystem'],
            message: 'Graphics & Particle system loaded',
            onComplete: null
        }, {
            scripts: ['scripts/screens/main.js'],
            message: 'Main core loaded',
            onComplete: null
        }, {
            scripts: ['screens/controls'],
            message: 'Controls system loaded',
            onComplete: null
        }, {
            scripts: ['controls/attract-mode'],
            message: 'Attract-mode loaded',
            onComplete: null
        }, {
            scripts: ['components'],
            message: 'Components loaded',
            onComplete: null
        }, {
            scripts: ['game-model'],
            message: 'Game Model loaded',
            onComplete: null
        }, {
            scripts: ['scripts/screens/game.js'],
            message: 'Game screen loaded',
            onComplete: null
        }, {
            scripts: ['screens/mainMenu', 'screens/highScore', 'screens/pause', 'screens/credits'],
            message: 'Remaining screens loaded',
            onComplete: null
        }];

    let assetOrder = [{
            key: 'background',
            source: '/static/background.jpg'
        }, {
            key: 'bee_1',
            source: '/static/bee_1.png'
        }, {
            key: 'bee_2',
            source: '/static/bee_2.png'
        }, {
            key: 'boss-f_1',
            source: '/static/boss-f_1.png'
        }, {
            key: 'boss-f_2',
            source: '/static/boss-f_2.png'
        }, {
            key: 'boss-h_1',
            source: '/static/boss-h_1.png'
        }, {
            key: 'boss-h_2',
            source: '/static/boss-h_2.png'
        }, {
            key: 'butterfly_1',
            source: '/static/butterfly_1.png'
        }, {
            key: 'butterfly_2',
            source: '/static/butterfly_2.png'
        }, {
            key: 'enterprise',
            source: '/static/enterprise.png'
        }, {
            key: 'Fighter',
            source: '/static/Fighter.png'
        }, {
            key: 'galaga-missile_1',
            source: '/static/galaga-missile_1.png'
        }, {
            key: 'galaga-missile_2',
            source: '/static/galaga-missile_2.png'
        }, {
            key: 'momiji',
            source: '/static/momiji.png'
        }, {
            key: 'tonbo',
            source: '/static/tonbo.png'
        }, {
            key: 'challenging_stage_over',
            source: '/audio/challenging_stage_over.mp3'
        }, {
            key: 'challenging_stage',
            source: '/audio/challenging_stage.mp3'
        }, {
            key: 'dive',
            source: '/audio/dive.mp3'
        }, {
            key: 'enemy_boom',
            source: '/audio/enemy_boom.mp3'
        }, {
            key: 'player_boom',
            source: '/audio/player_boom.mp3'
        }, {
            key: 'PurpleHaze',
            source: '/audio/PurpleHaze-Trim.mp3'
        }, {
            key: 'shot',
            source: '/audio/shot.mp3'
        }, {
            key: 'intro',
            source: '/audio/stage_intro.mp3'
        }, {
            key: 'stage',
            source: '/audio/stage.mp3'
        }];

    //------------------------------------------------------------------
    //
    // Helper function used to load scripts in the order specified by the
    // 'scripts' parameter.  'scripts' expects an array of objects with
    // the following format...
    //    {
    //        scripts: [script1, script2, ...],
    //        message: 'Console message displayed after loading is complete',
    //        onComplete: function to call when loading is complete, may be null
    //    }
    //
    //------------------------------------------------------------------
    function loadScripts(scripts, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (scripts.length > 0) {
            let entry = scripts[0];
            require(entry.scripts, function() {
                console.log(entry.message);
                if (entry.onComplete) {
                    entry.onComplete();
                }
                scripts.shift();    // Alternatively: scripts.splice(0, 1);
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // Helper function used to load assets in the order specified by the
    // 'assets' parameter.  'assets' expects an array of objects with
    // the following format...
    //    {
    //        key: 'asset-1',
    //        source: 'asset/.../asset.png'
    //    }
    //
    // onSuccess is invoked per asset as: onSuccess(key, asset)
    // onError is invoked per asset as: onError(error)
    // onComplete is invoked once per 'assets' array as: onComplete()
    //
    //------------------------------------------------------------------
    function loadAssets(assets, onSuccess, onError, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (assets.length > 0) {
            let entry = assets[0];
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    assets.shift();    // Alternatively: assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    assets.shift();    // Alternatively: assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // This function is used to asynchronously load image and audio assets.
    // On success the asset is provided through the onSuccess callback.
    // Reference: http://www.html5rocks.com/en/tutorials/file/xhr2/
    //
    //------------------------------------------------------------------
    function loadAsset(source, onSuccess, onError) {
        let xhr = new XMLHttpRequest();
        let fileExtension = source.substr(source.lastIndexOf('.') + 1);    // Source: http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                let asset = null;
                if (xhr.status === 200) {
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    } else if (fileExtension === 'mp3') {
                        asset = new Audio();
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        window.URL.revokeObjectURL(asset.src);
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) { onSuccess(asset); }
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }

    //------------------------------------------------------------------
    //
    // Called when all the scripts are loaded, it kicks off the demo app.
    //
    //------------------------------------------------------------------
    function mainComplete() {
        console.log('It is all loaded up');
        Game.main.initialize();
    }

    //
    // Start with loading the assets, then the scripts.
    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {    // Store it on success
            Game.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All game assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());
