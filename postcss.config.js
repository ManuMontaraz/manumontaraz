const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: [
    require('postcss-nested'),
    ...(isProduction ? [require('cssnano')({ preset: 'default' })] : [])
  ]
}
