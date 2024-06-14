const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname); // 当前目录作为输入目录
const outputDir = path.join(__dirname, 'output'); // 在当前目录创建 output 文件夹

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, {recursive: true});
}

// 递归处理每个文件和目录
function processDirectory(currentPath, prefix = '') {
	// 排除 output 目录
	if (currentPath === outputDir) {
		return;
	}

	fs.readdirSync(currentPath, {withFileTypes: true}).forEach(dirent => {
		const fullPath = path.join(currentPath, dirent.name);
		if (dirent.isDirectory()) {
			// 如果是目录，递归处理
			processDirectory(fullPath, prefix + dirent.name + '-');
		} else if (dirent.name.endsWith('.css')) {
			// 处理 CSS 文件
			convertCssToLess(fullPath, prefix, dirent.name);
		}
	});
}

// 将 CSS 转换为 LESS 并保存
function convertCssToLess(filePath, prefix, fileName) {
	const className = prefix + fileName.replace('.css', '');
	const content = fs.readFileSync(filePath, 'utf8');
	const lessContent = `.bcb-hl-${className} pre:not(.code-block-preview), pre.bcb-hl-${className} {\n${content}\n}\n`;
	const outputFilePath = path.join(outputDir, className + '.less');

	fs.writeFileSync(outputFilePath, lessContent);
	console.log(`Converted and saved: ${outputFilePath}`);
}

// 开始处理
processDirectory(inputDir);

console.log('All CSS files have been converted.');
