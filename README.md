lego-gears
==========

Helping you find the perfect Lego [gear train](https://en.wikipedia.org/wiki/Gear_train) for your project.

## example usage

Let's say you have the following situation:

![the-situation](https://raw.github.com/2sb18/lego-gears/master/readme-pics/example-usage.jpg)

https://raw.github.com/2sb18/lego-gears/master/readme-pics/problem.JPG
Your gear train has to connect the two axle pins, and you need it to have a gear ratio of 2:-1. This means that when the gear on the left axle pin spins, the gear on the right axle pin will spin in the opposite direction at twice the speed. For your gear train to work, it has to span 5.5 units across and 2.6666 or 8/3 units up.

I'm assuming you have Racket installed. If not, you can get it [here](http://racket-lang.org/download/).

From your shell, move to the lego-gears directory.

Open up a Racket xrepl session:

```shell
steve@grizzles:~/Dropbox/Personal/programming/scheme/lego-gears$ racket -il xrepl
Welcome to Racket v5.2.1.
->
```

Load in the lego-gears.rkt file:

```shell
-> ,en lego-gears.rkt
"lego-gears.rkt"> 
```

We're going to use the procedure called get-best-solutions. You call it like this:

 ```racket
(get-best-solutions list-of-objectives)```

An objective is a list with following elements: up, across, ratio. We only have one objective, which would look like this: (note that it's best to use rational numbers instead of decimal numbers)

```racket
'(8/3 11/2 -1/2)
```

Our list-of-objectives is a list of just one objective, so it looks like this:

```racket
'((8/3 11/2 -1/2))
```

Now we can call our get-best-solutions procedure:

```shell
"lego-gears.rkt"> (get-best-solutions '((8/3 11/2 -1/2)))
'(((24 24 0 3) (24 20 7/3 1/2) (20 12 1/3 2))
  ((24 24 0 3) (24 16 4/3 2) (16 12 4/3 1/2))
  ((24 24 1/3 3) (24 20 7/3 1/2) (20 12 0 2))
  ((24 24 1/3 3) (24 12 4/3 3/2) (12 12 1 1))
  ((24 24 2/3 3) (24 12 1 2) (12 12 1 1/2))
  ((24 24 2/3 3) (24 12 5/3 1) (12 12 1/3 3/2))
  ((24 24 4/3 5/2) (24 16 0 5/2) (16 12 4/3 1/2))
  ((24 24 4/3 5/2) (24 12 4/3 3/2) (12 12 0 3/2))
  ((24 16 1/3 5/2) (16 20 4/3 3/2) (20 12 1 3/2))
  ((24 16 2/3 5/2) (16 20 5/3 1) (20 12 1/3 2))
  ((24 16 4/3 2) (16 20 4/3 3/2) (20 12 0 2))
  ((24 16 5/3 3/2) (16 20 1 2) (20 12 0 2)))
```

The procedure returns a list of solutions. Let's take a look at the first solution.

```racket
'((24 24 0 3) (24 20 7/3 1/2) (20 12 1/3 2))
```

The solution is a list of three combinations. A combination has the following elements: first-gear, second-gear, up, across. The first element on our list is ```'(24 24 0 3)```. That is a 24-tooth gear meshed with a 24-tooth gear, that are separated by three units across.

![two-gears](https://raw.github.com/2sb18/lego-gears/master/readme-pics/two-gears.jpg)

The next element on our list is ```'(24 20 7/3 1/2)```. This means the last 24-tooth gear is meshed with a 20-tooth gear, which is separated by 7/3 units up and 1/2 units across.

![three-gears](https://raw.github.com/2sb18/lego-gears/master/readme-pics/three-gears.jpg)

The last element on our list is ```'(20 12 1/3 2)```. This means the last 20-tooth gear is meshed with a 12-tooth gear, which is separated by 1/3 units up and 1/2 units across.

![four-gears](https://raw.github.com/2sb18/lego-gears/master/readme-pics/four-gears.jpg)

That's the complete solution! You might have noticed that we only chose the first of many possible solutions. 
