const getBrowserScrollbarWidth = () => {
  const container = document.createElement('div');
  const containerStyles = {
    left: '-200px',
    overflow: 'scroll',
    position: 'fixed',
    top: '-200px',
    width: '100px',
  };
  Object.entries(containerStyles).forEach(([styleDeclaration, styleDeclarationValue]) => {
    container.style[styleDeclaration] = styleDeclarationValue;
  });
  document.body.append(container);
  const scrollbarWidth = container.offsetWidth - container.clientWidth;
  container.remove();
  return scrollbarWidth;
};
export { getBrowserScrollbarWidth };