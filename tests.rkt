#lang racket

(require "lego-gears.rkt")

(define multiple-objective (get-best-solutions '((0 3 1) (0 2 -1))))
(if (equal? multiple-objective '(((16 8 0 3/2) (8 16 0 3/2) (16 16 0 2))))
  'multiple-objective-passed
  'multiple-objective-failed)
