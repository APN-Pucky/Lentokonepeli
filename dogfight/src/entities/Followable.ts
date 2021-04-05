export interface Followable {
  followed: boolean
  getCenterX(): number;
  getCenterY(): number;
}

export function isFollowable(arg : any): arg is Followable {
  return arg && 'followed' in arg && 'getCenterX' in arg && 'getCenterY' in arg
  
}
