// Определяем константы Gulp 
// parallel- паралельно запускает разные команды 
// series- последовательное выполнение  команды task 
const { src, dest, watch, parallel, series } = require('gulp');


const scss = require('gulp-sass')(require('sass')); // Подключаем модули gulp-sass 
const concat = require('gulp-concat');// Подключаем gulp-concat
const uglify = require('gulp-uglify-es').default;// Подключаем gulp-uglify-es
const browserSync = require('browser-sync').create();// Подключаем Browsersync
const autoprefixer = require('gulp-autoprefixer');// Подключаем Autoprefixer
const clean = require('gulp-clean');// Подключаем gulp-clean для предварительной очистки папки dist  перед выполнением команды build 
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const cached = require('gulp-cached');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter'); // Подключаем плагин fonter для конвертации шрифтов
const ttf2woff2 = require('gulp-ttf2woff2');// Подключаем плагин ttf2woff2 для конвертации шрифтов
const svgSprite = require('gulp-svg-sprite'); // Подключаем плагин  svg-sprite
const include = require('gulp-include'); // Подключаем плагин  include

const del = require('del');

function pages() {
	return src('app/pages/*.html')
		.pipe(include({
			includePaths: 'app/components/'
		}))
		.pipe(dest('app')) // Выгружаем в папку с финальной сборкой
		.pipe(browserSync.stream()) // Обновление страницы браузера
}
function fonts() {
	return src('app/fonts/src/*.*') // Выбираем нужные файлы 
		.pipe(fonter({
			formats: ['woff', 'ttf'] // Конвертируем шрифты в форматы woff, ttf
		}))
		.pipe(src('app/fonts/*.ttf')) // Выбираем нужные файлы  ttf
		.pipe(ttf2woff2())
		.pipe(dest('app/fonts')) // Выгружаем в папку с финальной сборкой
}

function images() {
	return src(['app/images/src/**/*.*', '!app/images/src/*.svg'])
		.pipe(newer('app/images'))
		.pipe(avif({ quality: 50 }))

		.pipe(src('app/images/src/*.*'))
		.pipe(newer('app/images'))
		.pipe(webp())

		.pipe(src('app/images/src/**/*.*'))
		.pipe(newer('app/images'))
		.pipe(imagemin())

		.pipe(dest('app/images')) // Выгружаем в папку с финальной сборкой

}

function sprite() {
	return src('app/images/**/*.svg') // Выбираем нужные файлы
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('app/images'))  // Выгружаем в папку с финальной сборкой 
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/slick-carousel/slick/slick.js',
		'node_modules/mixitup/dist/mixitup.js',
		'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
		'app/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('app/scss/style.scss') // Выбираем нужные файлы
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
		.pipe(concat('style.min.css'))
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream()) // Обновление страницы браузера
}

function wathing() {
	browserSync.init({
		server: {
			baseDir: 'app/' // Указываем папку сервера
		}
	})
	watch(['app/scss/style.scss'], styles) // Мониторим файлы STYLES на изменения
	watch(['app/images/src/'], images) // Мониторим файлы IMAGE на изменения
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts) 	// Мониторим файлы JS на изменения 
	watch(['app/components/*', 'app/pages/*'], pages) 	// Мониторим файлы JS на изменения 
	watch(['app/*.html']).on('change', browserSync.reload); 	// Мониторим файлы HTML на изменения
}

function building() {
	return src([ // Выбираем нужные файлы
		'app/css/style.min.css', // Перенос файлов 
		'app/images/*.*',
		'!app/images/*.svg',
		'!app/images/**/*.html',
		'app/images/sprite.svg',
		'app/fonts/*.*',
		'app/js/main.min.js',
		'app/**/*.html'
	], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
		.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleanDist() { // Функция удаления
	return src('dist') // Выбираем нужную папку
		.pipe(clean()) // Удаляем папку "dist/" 
}


exports.styles = styles; // Экспортируем функцию styles() в таск styles
exports.building = building; // Экспортируем функцию building() в таск styles
exports.images = images; // Экспорт функции images() в таск images
exports.fonts = fonts; // Экспорт функции fonts() в таск fonts
exports.pages = pages; // Экспорт функции pages() в таск pages
exports.sprite = sprite; // Экспорт функции sprite() в таск images
exports.scripts = scripts; // Экспортируем функцию scripts() в таск scripts
exports.watching = wathing;
exports.build = series(cleanDist, building);
//exports.build = build; // Создаем новый таск "build", который последовательно выполняет нужные операции
exports.default = parallel(styles, images, scripts, pages, wathing); // Паралельно запускает  все команды одновременно styles, scripts, wathing вызовом команды GULP