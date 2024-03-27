import math
def MillerConvertion(lon,lat):
    L = 6381372 * math.pi * 2
    W = L
    H = L / 2
    mill = 2.3
    x = lon*math.pi/180
    y = lat*math.pi/180

    y = 1.25*math.log(math.tan(0.25*math.pi+0.4*y))
    
    x = (W/2) + (W)*x/(2*math.pi)
    y = (H/2) - (H)*y/(2*mill)
    return [x,y]

print(MillerConvertion(121.2120,31.2822))