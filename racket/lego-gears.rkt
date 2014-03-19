#lang racket

(require "gear-ratios.rkt")

(provide solve-gear-ratio
         get-best-solutions)

; define-memoized macro copied from John-Paul Verkamp's blog with his permission
; http://blog.jverkamp.com/2012/10/20/memoization-in-racket/
(define-syntax define-memoized
  (syntax-rules ()
    [(_ (f args ...) bodies ...)
     (define f
       ; store the cache as a hash of args => result
       (let ([results (make-hash)])
         ; need to do this to capture both the names and the values
         (lambda (args ...)
           ((lambda vals
              ; if we haven't calculated it before, do so now
              (when (not (hash-has-key? results vals))
                (hash-set! results vals (begin bodies ...)))
              ; return the cached result
              (hash-ref results vals))
            args ...))))]))

; future improvement: have a procedure that removes self-intersections
; future improvement: make the limit either horizontal or vertical

; first let's just try to solve going from one gear type to another
;
; our next gear can go either up or down, but the across always has to be positive

; this should return a list of solutions. each solution should be a list of gear combos.
; so here would be one solution
; ( (40 16 1/3 7/2) (16 

; this should return a list where each element is like
; (36 40 1 9/2)
; and there's the down move too
; (36 40 -1 9/2)
(define-memoized 
  (get-possible-combinations gear include-down? two-gears-on-one-axle-allowed?) 
  (let ((admissable-combinations 
          (if two-gears-on-one-axle-allowed?
            (append gear-combinations
                    (filter-map (lambda (combination) 
                                  (if (= (first combination) (second combination))
                                    #f
                                    (list (second combination)
                                          (first combination)
                                          (third combination))))
                                gear-combinations))
            (map (lambda (combination)
                   (if (= (first combination) gear)
                     combination
                     (list (second combination) (first combination) (third combination))))
                 (filter (lambda (x)
                           (or (= gear (car x))
                               (= gear (cadr x))))
                         gear-combinations)))))
    ; this gives a list of possibilities, each possibility being a list
    (define (expand-possibilities combination)
      (let ((positive-possibilities (map (lambda (up-and-across)
                                           (list (car combination)
                                                 (cadr combination)
                                                 (car up-and-across)
                                                 (cadr up-and-across)))
                                         (caddr combination))))
        (let ((negative-possibilities (map (lambda (x)
                                             (list (car x) (cadr x) (- (caddr x)) (cadddr x)))
                                           (filter (lambda (x) (not (= 0 (caddr x))))
                                                   positive-possibilities))))
          (if include-down?  
            (append positive-possibilities negative-possibilities)
            positive-possibilities))))
    (apply append (map expand-possibilities admissable-combinations))))

; solve-gear-ratio returns false if it doesn't work

; solve-gear-ratio returns a list of solutions if it does work

; maybe call combination head-combo and tail-combos and list-of-tail-combos

; head looks like '(8 8 0 1)
; tails is a list of solutions.  is a list of combos
; so tails looks like '(((1 2 3 4) (1 2 3 2)) ((1 2 1 2) (2 3 4 3)))
; 
(define (combine-head-and-tails head-combo tail-solutions)
  (cond ((not tail-solutions) #f)  ; if tail-solutions is false, that means that no solution could be found, propogate the #f
        ((= 0 (length tail-solutions)) (list (list head-combo)))
        (else (filter-map (lambda (tail-combo)
                            (cons head-combo tail-combo))
                          tail-solutions))))

; the objectives are the points, and this procedure gives us the piecewise straight line distances
; from point to point
; this is the real physical distance
(define (get-total-distance list-of-objectives)
  (if (null? list-of-objectives)
    0
    (+ (sqrt (+ (expt (* up-unit-in-mm (caar list-of-objectives)) 2)
                (expt (* across-unit-in-mm (cadar list-of-objectives)) 2)))
       (get-total-distance (cdr list-of-objectives)))))

(define (subtract-combo-from-list-of-objectives combination list-of-objectives)
  (let ((ratio-left (if (= 3 (length (car list-of-objectives)))
                      (caddar list-of-objectives)
                      '())))
    (cons
      (append 
        (list (- (caar list-of-objectives) (third combination))
              (- (cadar list-of-objectives) (fourth combination)))
        (if (null? ratio-left)
          '()
          (list (- (* ratio-left (/ (first combination) (second combination)))))))
      (cdr list-of-objectives))))

; an objective looks like '(up across ratio) 
; an objective can also look like this '(up across) if we don't care about what the ratio is
; can we put multiple gears on one axle?
; this checks to make sure we're getting closer to our objective
(define (solve-gear-ratio list-of-objectives include-down? two-gears-on-one-axle-allowed?)
  (define (get-solutions list-of-objectives-left previous-gear) 
    (let ((solutions
            (apply append
                   (filter-map
                     (lambda (combination)
                       ; this gives back a list of solutions
                       (combine-head-and-tails 
                         combination
                         (let ((new-list-of-objectives-left (subtract-combo-from-list-of-objectives
                                                              combination list-of-objectives-left)))
                           ; this is the part that makes sure we're getting closer
                           ; to our objective
                           ; we have to get at least 1mm closer to our goal
                           (if (< (+ 1 (get-total-distance new-list-of-objectives-left))
                                  (get-total-distance list-of-objectives-left))
                             (iter new-list-of-objectives-left (second combination))
                             #f))))
                     (get-possible-combinations previous-gear include-down? two-gears-on-one-axle-allowed?)))))
      (if (= 0 (length solutions))
        #f
        solutions)))
  ; returns a list of solutions 
  (define-memoized (iter list-of-objectives-left previous-gear)
                   (let ((up-left (caar list-of-objectives-left))
                         (across-left (cadar list-of-objectives-left))
                         (ratio-left (if (= 3 (length (car list-of-objectives-left)))
                                       (caddar list-of-objectives-left)
                                       '())))
                     (cond ((< across-left 0) #f)
                           ((= across-left 0)
                            (if (or (and (= 3 (length (car list-of-objectives-left))) (= up-left 0) (= ratio-left 1))
                                    (and (= 2 (length (car list-of-objectives-left))) (= up-left 0)))
                              (if (= 1 (length list-of-objectives-left))
                                '()
                                (get-solutions (cdr list-of-objectives-left) previous-gear)) 
                              #f))
                           (else  
                             (get-solutions list-of-objectives-left previous-gear)))))
  (apply append
         (filter-map
           (lambda (starting-gear)
             (iter list-of-objectives starting-gear))
           (if two-gears-on-one-axle-allowed?
             '(0)   ; if two-gears-on-one-axle-allowed? is true, then we don't have to go through each starting gear
             gear-sizes))))

(define (get-shortest-solutions solutions)
  (if (= 0 (length solutions))
    '()
    ; x is the new guy, y is the length of the current champion
    (let ((shortest-length (foldr (lambda (x y) (if (< (length x) y) (length x) y))
                                  (length (car solutions))
                                  solutions)))
      (filter (lambda (x) (= shortest-length (length x))) solutions))))

(define (ratio-of-solution solution)
  (if (null? solution)
    1
    (- (* (/ (cadar solution) (caar solution))
          (ratio-of-solution (cdr solution))))))

; if big-ratio is true, that means we want a lot torque,
; if big-ratio is false, that means we want a lot of speed
(define (get-solutions-with-best-ratio solutions negative-ratio? big-ratio?)
  ; let's convert all ratios into big positives
  (define (converter ratio)
    (let ((negatized (if negative-ratio? (- ratio) ratio)))
      (if big-ratio? negatized (/ 1 negatized))))
  (let ((best-ratio (foldr (lambda (x y) (if (> (converter (ratio-of-solution x)) y)
                                           (converter (ratio-of-solution x))
                                           y))
                           -10000000
                           solutions)))
    (filter (lambda (x) (= best-ratio (converter (ratio-of-solution x)))) solutions)))


(define (is-element-in-list? element lst)
  (cond ((null? lst) #f)
        ((= element (car lst)) #t)
        (else (is-element-in-list? element (cdr lst)))))

(define (solution-with-preferred-gears? solution preferred-gears)
  (cond ((null? solution) #t)
        ((or (not (is-element-in-list? (caar solution) preferred-gears))
             (not (is-element-in-list? (cadar solution) preferred-gears)))
         #f)
        (else (solution-with-preferred-gears? (cdr solution) preferred-gears))))

(define (get-solutions-with-preferred-gears solutions list-of-preferred-gears)
  (filter (lambda (x)
            (solution-with-preferred-gears? x list-of-preferred-gears))
          solutions))

; "best" is pretty subjective. Here's the order in which I define best
; solutions.
; 1. shortest solutions using '(24 20 16 12)
; 2. shortest solutions using '(24 20 16 12 8)
; 3. shortest solutions using '(40 36 24 20 16 12 8)
; best does not include down movements
(define (get-best-solutions list-of-objectives)
  (let ((solutions (solve-gear-ratio list-of-objectives #f #f)))
    (let ((awesome-solutions (get-shortest-solutions 
                               (get-solutions-with-preferred-gears
                                 solutions '(24 20 16 12))))
          (good-solutions (get-shortest-solutions 
                            (get-solutions-with-preferred-gears
                              solutions '(24 20 16 12 8))))
          (alright-solutions (get-shortest-solutions
                               (get-solutions-with-preferred-gears
                                 solutions '(40 36 24 20 16 12 8)))))
      (cond ((< 0 (length awesome-solutions)) awesome-solutions)
            ((< 0 (length good-solutions)) good-solutions)
            (else alright-solutions)))))

