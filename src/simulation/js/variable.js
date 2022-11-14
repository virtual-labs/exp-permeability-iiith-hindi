'use strict';

document.addEventListener('DOMContentLoaded', function() {

	const restartButton = document.getElementById('restart');
	const instrMsg = document.getElementById('procedure-message');

	restartButton.addEventListener('click', function() { restart(); });

	function finish(step)
	{
		if(!flag && step === enabled.length - 1)
		{
			flag = true;
			logic(tableData);
			generateTableHead(table, Object.keys(tableData[0]));
			generateTable(table, tableData);

			document.getElementById("apparatus").style.display = 'none';
			document.getElementById("observations").style.width = '40%';
			if(small)
			{
				document.getElementById("observations").style.width = '85%';
			}
		}
	};

	function getBaseLog(x, y) {
		return Number((Math.log(y) / Math.log(x)).toFixed(2));
	};

	function randomNumber(min, max) {
		return (Math.random() * (max - min + 1) + min).toFixed(2);
	};

	function randomInt(min, max) {
		return Number(Math.floor(randomNumber(min, max)));
	};

	function logic(tableData)
	{
		const h1 = [randomInt(82, 87), randomInt(73, 78), randomInt(62, 67)], h2 = [randomInt(23, 25), randomInt(19, 21), randomInt(19, 21)], times = [randomNumber(14, 15.5), randomNumber(14, 15.5), randomNumber(14, 15.5)];
		tableData.forEach(function(row, index) {
			row['Trial No.'] = index;
			row['Starting Head, h1(cm)'] = h1[index];
			row['Final Head, h2(cm)'] = h2[index];
			row['Elapsed Time, t(sec)'] = times[index];
			row['Permeability, K(cm/sec)'] = (2.303 * a * length * getBaseLog(10, (h1[index] / h2[index])) / (A * times[index])).toFixed(3);
		});
	};

	function flow(obj, change, lim) {
		if(obj.waterHeight >= lim)
		{
			return 1;
		}

		obj.waterHeight += change;
		return 0;
	};

	class container {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
			this.img = new Image();
			this.img.src = './images/container.png';
			this.img.onload = () => { ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height); };
		};

		draw(ctx) {
			ctx.fillStyle = data.colors.blue;
			ctx.beginPath();
			ctx.rect(this.pos[0] + 5, this.pos[1] + this.height - 5, this.width - 10, -this.waterHeight);
			ctx.closePath();
			ctx.fill();

			ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);
		};
	};

	class soil {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
		};

		draw(ctx) {
			ctx.beginPath();
			ctx.fillStyle = data.colors.soilBrown;
			ctx.lineWidth = 0.001;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.height);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = data.colors.blue;
			ctx.globalAlpha = 0.3;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.waterHeight);
			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		};
	};

	class mould {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.filter = false;
			this.waterStart = y + 0.4 * height;
			this.waterHeight = 0;
			this.outPercent = [0, 0];
		};

		draw(ctx) {
			const mouldWidth = 0.8 * this.width, mouldHeight = 0.6 * this.height, filterHeight = 0.2 * mouldHeight, pipeWidth = 0.05 * this.height; 
			ctx.lineWidth = 4;

			// Main mould
			ctx.fillStyle = data.colors.gray;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight + filterHeight, mouldWidth, mouldHeight - 2 * filterHeight);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Green filters
			ctx.fillStyle = data.colors.green;
			if(this.filter)
			{
				ctx.beginPath();
				ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight, mouldWidth, filterHeight);
				ctx.rect(this.pos[0], this.pos[1] + this.height - filterHeight, mouldWidth, filterHeight);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

				ctx.beginPath();

				ctx.moveTo(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.pos[1]);
				ctx.lineTo(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.pos[1] + this.height - mouldHeight)
				ctx.moveTo(this.pos[0] + mouldWidth / 2 + pipeWidth / 2, this.pos[1]);
				ctx.lineTo(this.pos[0] + mouldWidth / 2 + pipeWidth / 2, this.pos[1] + this.height - mouldHeight)

				ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height);
				ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height)
				ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth);
				ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height - pipeWidth)
				ctx.stroke();
			}
	
			ctx.fillStyle = data.colors.blue;
			ctx.beginPath();

			if(this.waterHeight > 0)
			{
				if(this.waterStart + this.waterHeight > this.pos[1] + this.height - mouldHeight)
				{
					ctx.rect(this.pos[0] + mouldWidth / 2 - pipeWidth / 2 + 2, this.waterStart, pipeWidth - 4, (this.pos[1] + this.height - mouldHeight) - this.waterStart);

					ctx.closePath();
					ctx.fill();
					ctx.globalAlpha = 0.3;
					ctx.beginPath();

					ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight, mouldWidth, this.waterStart + this.waterHeight - (this.pos[1] + this.height - mouldHeight));
					ctx.fill();
					ctx.closePath();
					ctx.globalAlpha = 1;
					ctx.beginPath();
				}

				else
				{
					ctx.rect(this.pos[0] + mouldWidth / 2 - pipeWidth / 2 + 2, this.waterStart, pipeWidth - 4, this.waterHeight);
				}
			}

			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		};

		fill(change) {
			if(this.waterHeight >= 0.85 * 0.4 * this.height)
			{
				return 1;
			}

			this.waterStart -= change;
			this.waterHeight += change;
			return 0;
		};
	};

	class tank {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
			this.innerWaterHeight = height;
			this.outlet = [20, 10];
		};

		draw(ctx) {
			const gap = 5;

			ctx.lineWidth = 4;
			ctx.fillStyle = data.colors.blue;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1] + (this.height - this.innerWaterHeight), this.width, this.innerWaterHeight);
			ctx.closePath();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(this.pos[0], this.pos[1]);
			ctx.lineTo(this.pos[0], this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1]);
			ctx.lineTo(this.pos[0] + this.width + this.outlet[0], this.pos[1] + this.outlet[1]);
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.lineWidth = 6;
			ctx.strokeStyle = data.colors.blue;
			ctx.moveTo(this.pos[0] + this.width, this.pos[1] - 4);
			if(this.waterHeight > this.outlet[1])
			{
				if(this.waterHeight > this.outlet[1] + gap)
				{
					ctx.lineTo(this.pos[0] + this.width + 2 * (this.outlet[1] + gap), this.pos[1] - 4 + this.outlet[1] + gap);
					ctx.lineTo(this.pos[0] + this.width + 2 * (this.outlet[1] + gap), this.pos[1] - 4 + this.waterHeight);
				}

				else
				{
					ctx.lineTo(this.pos[0] + this.width + 2 * this.waterHeight, this.pos[1] - 4 + this.waterHeight);
				}
			}
			ctx.stroke();
			ctx.strokeStyle = 'black';
		};
	};

	function init()
	{
		document.getElementById("output1").innerHTML = "Length of Soil Sample, L = ____ cm";
		document.getElementById("output2").innerHTML = "Diameter of Soil Sample, D = ____ cm";
		document.getElementById("output3").innerHTML = "Cross-Sectional Area of Soil Sample, A = ____ cm<sup>2<sup>";
		document.getElementById("output4").innerHTML = "Cross-Sectional Area of Stand Pipe, a = ____ cm<sup>2</sup>";

		objs = {
			"tank": new tank(55, 210, 70, 320),
			"mould": new mould(240, 160, 90, 100),
			"filters": '',
			"water": '',
			"soil": new soil(90, 125, 92, 222.5),
			"container": new container(50, 75, 290, 350),
		};
		keys = [];

		enabled = [["mould"], ["mould", "soil"], ["mould", "soil", "filters"], ["mould", "soil", "water"], ["mould", "soil", "tank"], ["mould", "soil", "tank", "container"], ["mould", "soil", "tank", "container"], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
		flag = false;
	};

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		document.getElementById("apparatus").style.display = 'block';
		document.getElementById("observations").style.width = '';

		table.innerHTML = "";
		init();

		tmHandle = window.setTimeout(draw, 1000 / fps); 
	};

	function generateTableHead(table, data) {
		const thead = table.createTHead();
		const row = thead.insertRow();
		data.forEach(function(key, ind) {
			const th = document.createElement("th");
			const text = document.createTextNode(key);
			th.appendChild(text);
			row.appendChild(th);
		});
	};

	function generateTable(table, data) {
		data.forEach(function(rowVals, ind) {
			const row = table.insertRow();
			Object.keys(rowVals).forEach(function(key, i) {
				const cell = row.insertCell();
				const text = document.createTextNode(rowVals[key]);
				cell.appendChild(text);
			});
		});
	};

	function check(event, translate, step, flag=true)
	{ 
		if(translate[0] !== 0 || translate[1] !== 0)
		{
			return;
		}

		const canvasPos = [(canvas.width / canvas.offsetWidth) * (event.pageX - canvas.offsetLeft), (canvas.height / canvas.offsetHeight) * (event.pageY - canvas.offsetTop)];
		const errMargin = 10;

		let hover = false;
		canvas.style.cursor = "default";
		keys.forEach(function(val, ind) {
			if(canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
			{
				if(step === 6 && val === "mould")
				{
					hover = true;
					translate[1] = 0.5;
				}
			}
		});

		if(!flag && hover)
		{
			canvas.style.cursor = "pointer";
			translate[0] = 0;
			translate[1] = 0;
			lim[0] = 0;
			lim[1] = 0;
		}
	};

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const border = "black", lineWidth = 1.5, fps = 150;
	const msgs = [
		"Click on 'Mould' in the apparatus menu to add a mould to the workspace.",
		"Click on 'Soil Sample' in the apparatus menu to add a soil sample to the mould.",
		"Click on 'Filters' in the apparatus menu to add filters with outlet pipes to the mould where the top filter pipe has an attached stand pipe.",
		"Click on 'Water' in the apparatus menu to add water to the stand pipe.",
		"Click on 'Tank' in the apparatus menu to add a filled tank to the workspace such that the mould is inside it.",
		"Click on 'Container' in the apparatus menu to add a container to the workspace.",
		"Click on the mould to allow the water to flow through the mould.",
		"Click the restart button to perform the experiment again.",
	];

	let step, translate, lim, objs, keys, enabled, small, flag;
	const a = 1.04, length = 13.2, diameter = 6.35, A = Number((Math.PI * diameter * diameter / 4).toFixed(2));
	init();

	const tableData = [
		{ "Trial No.": "", "Starting Head, h1(cm)": "", "Final Head, h2(cm)": "", "Elapsed Time, t(sec)": "", "Permeability, K(cm/sec)": "" },
		{ "Trial No.": "", "Starting Head, h1(cm)": "", "Final Head, h2(cm)": "", "Elapsed Time, t(sec)": "", "Permeability, K(cm/sec)": "" },
		{ "Trial No.": "", "Starting Head, h1(cm)": "", "Final Head, h2(cm)": "", "Elapsed Time, t(sec)": "", "Permeability, K(cm/sec)": "" },
	];

	const objNames = Object.keys(objs);
	objNames.forEach(function(elem, ind) {
		const obj = document.getElementById(elem);
		obj.addEventListener('click', function(event) {
			if(elem === "soil")
			{
				document.getElementById("output1").innerHTML = "Length of Soil Sample, L = " + String(length) + " cm";
				document.getElementById("output2").innerHTML = "Diameter of Soil Sample, D = " + String(diameter) + " cm";
				document.getElementById("output3").innerHTML = "Cross-Sectional Area of Soil Sample, A = " + String(A) + " cm<sup>    2<sup>";
			}

			else if(elem === "filters")
			{
				document.getElementById("output4").innerHTML = "Cross-Sectional Area of Stand Pipe, a = " + String(a) + " cm<sup>2</sup>";
				objs['mould'].filter = true;
				step += 1;
				return;
			}

			else if(elem === "water")
			{
				translate[1] = 0.5;
				return;
			}

			keys.push(elem);
			step += 1;
		});
	});

	canvas.addEventListener('mousemove', function(event) {check(event, translate, step, false);});
	canvas.addEventListener('click', function(event) {check(event, translate, step);});

	function responsiveTable(x) {
		if(x.matches)	// If media query matches
		{ 
			small = true;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '85%';
			}
		} 

		else
		{
			small = false;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '40%';
			}
		}
	};

	let x = window.matchMedia("(max-width: 1023px)");
	responsiveTable(x); // Call listener function at run time
	x.addListener(responsiveTable); // Attach listener function on state changes

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		let ctr = 0;
		document.getElementById("main").style.pointerEvents = 'none';

		objNames.forEach(function(name, ind) {
			document.getElementById(name).style.pointerEvents = 'auto';
			if(keys.includes(name) || !(enabled[step].includes(name)))
			{
				document.getElementById(name).style.pointerEvents = 'none';
			}

			if(keys.includes(name)) 
			{
				if(enabled[step].includes(name))
				{
					ctr += 1;
				}
				objs[name].draw(ctx);
			}
		});

		if(ctr === enabled[step].length)
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;
			if(step === 3)
			{
				temp += objs['mould'].fill(translate[1]);
			}

			if(step === 6)
			{
				if(!flow(objs['mould'], translate[1], objs['mould'].height - (objs['mould'].waterStart - objs['mould'].pos[1])))
				{
					objs['mould'].waterStart += 0.5 * translate[1];
				}

				else if(flow(objs['tank'], translate[1], 75))
				{
					temp += flow(objs['container'], translate[1], objs['container'].height - 15);
				}

				if(objs['mould'].waterStart + objs['mould'].waterHeight >= objs['soil'].pos[1])
				{
					flow(objs['soil'], 1.5 * translate[1], objs['soil'].height);
				}
			}

			if(temp !== step)
			{
				translate[1] = 0;
			}
			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		finish(step);
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
