# Class: FlowConnect

FlowConnect can be considered as a container storing all Flows created by it, a FlowConnect instance can render one Flow at a time on-screen.

A FlowConnect instance is bound to exactly one <code>&lt;canvas&gt;</code>, this instance maintains/tracks the dimensions of that canvas, registers user-interaction events (mouse, keyboard, touch) and creates additional OffScreenCanvas's to track/act-upon these events.
