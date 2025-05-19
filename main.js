const keyTest = (e)=>{
  console.log('keyTest', e.key, e.code);
}
document.addEventListener('keydown', (e)=>{
  keyTest(e);
});