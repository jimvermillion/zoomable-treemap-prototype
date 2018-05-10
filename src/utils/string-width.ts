export const stringWidth = (stringThing, size = 12) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
        context.font = `${size}px Verdana`;
        return Math.ceil(context.measureText(stringThing).width);
    }
    return 0;
};
