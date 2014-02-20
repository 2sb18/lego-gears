#lang racket

(require "gear-ratios.rkt")

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
(define (get-possible-combinations gear)
  (let ((admissable-combinations (map (lambda (combination)
                                        (if (= (first combination) gear)
                                          combination
                                          (list (second combination) (first combination) (third combination))))
                                      (filter (lambda (x)
                                                (or (= gear (car x))
                                                    (= gear (cadr x))))
                                              gear-combinations))))
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
          ; (append positive-possibilities negative-possibilities))))
          positive-possibilities)))
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

(define (solve-gear-ratio up across ratio)
  (define-memoized (iter up-left across-left ratio-left previous-gear)
                   ; (doing-another)
                   (cond ((< across-left 0) #f)
                         ((< up-left 0) #f)
                         ; ((< (* 1.25 up) (abs up-left)) #f)
                         ((= across-left 0)
                          (if (and (= up-left 0) (= ratio-left 1))
                            '()
                            #f))
                         (else  
                           (let ((solutions
                                   (apply append
                                          (filter-map
                                            (lambda (combination)
                                              ; this gives back a list of solutions
                                              (combine-head-and-tails 
                                                combination
                                                (iter (- up-left (third combination))
                                                      (- across-left (fourth combination))
                                                      (- (* ratio-left (/ (second combination) (first combination))))
                                                      (second combination))))
                                            (get-possible-combinations previous-gear)))))
                             (if (= 0 (length solutions))
                               #f
                               solutions)))))
  (apply append
         (filter-map
           (lambda (starting-gear)
             (iter up across ratio starting-gear))
           gear-sizes)))

(define (get-shortest-solutions solutions)
  (if (= 0 (length solutions))
    '()
    (let ((shortest-length (foldr (lambda (x y) (if (< (length x) y) (length x) y))
                                  (length (car solutions))
                                  solutions)))
      (filter (lambda (x) (= shortest-length (length x))) solutions))))

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
(define (get-best-solutions up across ratio)
  (let ((solutions (solve-gear-ratio up across ratio)))
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

