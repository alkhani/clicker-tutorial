var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

game.state.add('play', {
	preload: function() {
		this.game.load.image('forest-back', 'assets/parallax_forest_pack/layers/parallax-forest-back-trees.png');
		this.game.load.image('forest-lights', 'assets/parallax_forest_pack/layers/parallax-forest-lights.png');
		this.game.load.image('forest-middle', 'assets/parallax_forest_pack/layers/parallax-forest-middle-trees.png');
		this.game.load.image('forest-front', 'assets/parallax_forest_pack/layers/parallax-forest-front-trees.png');
		this.game.load.image('aerocephal', 'assets/allacrost_enemy_sprites/aerocephal.png');
		this.game.load.image('arcana_drake', 'assets/allacrost_enemy_sprites/arcana_drake.png');
		this.game.load.image('aurum-drakueli', 'assets/allacrost_enemy_sprites/aurum-drakueli.png');
		this.game.load.image('bat', 'assets/allacrost_enemy_sprites/bat.png');
		this.game.load.image('daemarbora', 'assets/allacrost_enemy_sprites/daemarbora.png');
		this.game.load.image('deceleon', 'assets/allacrost_enemy_sprites/deceleon.png');
		this.game.load.image('demonic_essence', 'assets/allacrost_enemy_sprites/demonic_essence.png');
		this.game.load.image('dune_crawler', 'assets/allacrost_enemy_sprites/dune_crawler.png');
		this.game.load.image('green_slime', 'assets/allacrost_enemy_sprites/green_slime.png');
		this.game.load.image('nagaruda', 'assets/allacrost_enemy_sprites/nagaruda.png');
		this.game.load.image('rat', 'assets/allacrost_enemy_sprites/rat.png');
		this.game.load.image('scorpion', 'assets/allacrost_enemy_sprites/scorpion.png');
		this.game.load.image('skeleton', 'assets/allacrost_enemy_sprites/skeleton.png');
		this.game.load.image('snake', 'assets/allacrost_enemy_sprites/snake.png');
		this.game.load.image('spider', 'assets/allacrost_enemy_sprites/spider.png');
		this.game.load.image('stygian_lizard', 'assets/allacrost_enemy_sprites/stygian_lizard.png');

	},
	create: function() {
		var state = this;

		//
		// Background
		//
		this.background = this.game.add.group();
		// setup each of our background layers to take the full screen
		// ['forest-back', 'forest-lights', 'forest-middle', 'forest-front']
		// 	.forEach(function(image) {
		// 		var bg = state.game.add.tileSprite(0,0,state.game.world.width, state.game.world.height, image, '', state.background);
		// 		bg.tileScale.setTo(4,4);
		// 	});

		//
		// Monsters
		//
		var monsterData = [
			{name: 'Aerocephal',        image: 'aerocephal',        maxHealth: 10},
			{name: 'Arcana Drake',      image: 'arcana_drake',      maxHealth: 20},
			{name: 'Aurum Drakueli',    image: 'aurum-drakueli',    maxHealth: 30},
			{name: 'Bat',               image: 'bat',               maxHealth: 5},
			{name: 'Daemarbora',        image: 'daemarbora',        maxHealth: 10},
			{name: 'Deceleon',          image: 'deceleon',          maxHealth: 10},
			{name: 'Demonic Essence',   image: 'demonic_essence',   maxHealth: 15},
			{name: 'Dune Crawler',      image: 'dune_crawler',      maxHealth: 8},
			{name: 'Green Slime',       image: 'green_slime',       maxHealth: 3},
			{name: 'Nagaruda',          image: 'nagaruda',          maxHealth: 13},
			{name: 'Rat',               image: 'rat',               maxHealth: 2},
			{name: 'Scorpion',          image: 'scorpion',          maxHealth: 2},
			{name: 'Skeleton',          image: 'skeleton',          maxHealth: 6},
			{name: 'Snake',             image: 'snake',             maxHealth: 4},
			{name: 'Spider',            image: 'spider',            maxHealth: 4},
			{name: 'Stygian Lizard',    image: 'stygian_lizard',    maxHealth: 20}
		];

		this.monsters = this.game.add.group();

		// create the sprite for each monster. Put it off-screen. Tie it to our Monster data array. 
		// make it clickable. set health to max. give it killed & revived events.
		var monster;
		monsterData.forEach(function(data) {
			// create a sprite for them off screen. 
			// create(x axis, y axis, reference image). Only works for Sprites.
			monster = state.monsters.create(1000, state.game.world.centerY, data.image);
			// center anchor
			monster.anchor.setTo(0.5);
			// give sprite a reference to the database. 
			monster.details = data;
			// enable input so we can click it!
			monster.inputEnabled = true;
			monster.events.onInputDown.add(state.onClickMonster, state); // input (function with sprite & pointer, state)
			// set the sprite's health param to max health in the database. You heard that right, Sprite alreay has a health param!
			monster.health = monster.maxHealth = data.maxHealth;
			// hook into health and lifecycle events
			monster.events.onKilled.add(state.onKilledMonster, state);
			monster.events.onRevived.add(state.onRevivedMonster, state);
		});

		// pick a monster and put it on the screen
		this.currentMonster = this.monsters.getRandom();
		this.currentMonster.position.set(this.game.world.centerX + 100, this.game.world.centerY);

		// put name and health text below the monster 
		console.log(this.currentMonster.height);
		this.monsterInfoUI = this.game.add.group();
		this.monsterInfoUI.position.setTo(this.currentMonster.x, this.currentMonster.y + 150);
		this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(0,0,this.currentMonster.details.name, {
			font:'48px Arial Black',
			fill: '#fff',
			strokeThickness: 4
		}));
		this.monsterNameText.anchor.setTo(0.5);
		this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(0, 50, this.currentMonster.health + ' HP', {
			font: '32px Arial Black',
			fill: '#ff0000',
			strokeThickness: 4
		}));
		this.monsterHealthText.anchor.setTo(0.5);

		//
		// Player
		//
		this.player = {
			clickDmg: 50,
			gold: 0
		};

		//
		// Damage Text
		//
		// create 50 placeholder numbers
		// give them each a tween property so they fly away whenever we draw one of them 
		this.dmgTextPool = this.add.group();
		var dmgText;
		for (var d=0; d<50; d++) {
			// add text (x coord, y coord, text, formatting)
			dmgText = this.add.text(0,0,'1', {
				font: '64px Arial Black',
				fill: '#fff',
				strokeThickness: 4
			});
			dmgText.anchor.setTo(0.5);
			// don't draw it yet
			dmgText.exists = false;
			// "For the damage text, we want it to fly out from where it was clicked in a random direction 
			// and also fade out so that by the time that it reaches its destination, it can no longer be seen."
			dmgText.tween = game.add.tween(dmgText)
				.to({ // the final destination of the tween animation. (final alpha opacity, final x coord, final y coord, milliseconds to animate (1000 = 1s), Easing equation we want ot use)
					alpha: 0, 
					y: 100,
					x: this.game.rnd.integerInRange(100, 700)
				}, 1000, Phaser.Easing.Cubic.Out);

			// kill the text when the tween ends
			dmgText.tween.onComplete.add(function(text, tween) {
				text.kill();
			});
			this.dmgTextPool.add(dmgText);
		}

	},

	render: function() {
		// built-in sprite debug
		this.game.debug.spriteInfo(this.currentMonster, 100, 100, 'white');
		this.game.debug.spriteInputInfo(this.currentMonster, 100, 200);

		// custom debug
		this.game.debug.start(100, 300, 'white');
		this.game.debug.line('name: ' + this.currentMonster.details.name);
		this.game.debug.line('height: ' + this.currentMonster.height);
		this.game.debug.line('text position: ' + this.monsterInfoUI.x + ', ' + this.monsterInfoUI.y)
		this.game.debug.stop();
	},

	onClickMonster: function(monster, pointer) {
		// apply damage to monster
		this.currentMonster.damage(this.player.clickDmg);
		// update the health text
		this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'DEAD';
		// animate the damage flying out of the monster
		var dmgText = this.dmgTextPool.getFirstExists(false);
		if (dmgText) {
			dmgText.text = this.player.clickDmg;
			dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
			dmgText.alpha = 1;
			dmgText.tween.start();
		}

	},

	// take the current monster away and.. revive another one
	onKilledMonster: function(monster) {
		// move the monster off screen again
		monster.position.set(1000, this.game.world.centerY);
		// pick a new monster
		this.currentMonster = this.monsters.getRandom();
		// make sure it has full health
		this.currentMonster.revive(this.currentMonster.maxHealth);
	},

	// new monster appears
	onRevivedMonster: function(monster) {
		// put a monster back in view 
		monster.position.set(this.game.world.centerX + 100, this.game.world.centerY);
		// update the name and health text
		this.monsterNameText.text = monster.details.name;
		this.monsterHealthText.text = monster.details.maxHealth + ' HP';
	}

});

game.state.start('play');

