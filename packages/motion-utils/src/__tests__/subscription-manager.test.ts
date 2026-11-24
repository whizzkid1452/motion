import { SubscriptionManager } from "../subscription-manager"

describe("SubscriptionManager", () => {
    test("Adds a subscription", () => {
        const manager = new SubscriptionManager()
        const callback = jest.fn()
        manager.add(callback)
        manager.notify(2)
        expect(callback).toBeCalledTimes(1)
        expect(callback).toBeCalledWith(2, undefined, undefined)
    })

    test("Removes a subscription", () => {
        const manager = new SubscriptionManager()
        const callback = jest.fn()
        const remove = manager.add(callback)
        remove()
        manager.notify(2)
        expect(callback).toBeCalledTimes(0)
    })

    test("Clears all subscription", () => {
        const manager = new SubscriptionManager()
        const callback = jest.fn()
        manager.add(callback)
        manager.clear()
        manager.notify(2)
        expect(callback).toBeCalledTimes(0)
    })

    test("Notifies multiple subscribers in registration order with all arguments", () => {
        const manager = new SubscriptionManager()
        const calls: string[] = []
        const first = jest.fn(() => calls.push("first"))
        const second = jest.fn(() => calls.push("second"))
        manager.add(first)
        manager.add(second)

        manager.notify(1, 2, 3)

        expect(calls).toEqual(["first", "second"])
        expect(first).toHaveBeenCalledWith(1, 2, 3)
        expect(second).toHaveBeenCalledWith(1, 2, 3)
    })

    test("Does not register the same subscriber twice", () => {
        const manager = new SubscriptionManager()
        const callback = jest.fn()
        manager.add(callback)
        manager.add(callback)

        expect(manager.getSize()).toBe(1)
        manager.notify()
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test("Removing an absent subscriber leaves other subscribers registered", () => {
        const manager = new SubscriptionManager()
        const callback = jest.fn()
        const remove = manager.add(callback)
        const remaining = jest.fn()
        manager.add(remaining)

        remove()
        remove()
        manager.remove(jest.fn())
        manager.notify()

        expect(manager.getSize()).toBe(1)
        expect(callback).not.toHaveBeenCalled()
        expect(remaining).toHaveBeenCalledTimes(1)
    })

    test("Clearing during notification skips the remaining subscribers", () => {
        const manager = new SubscriptionManager()
        const remaining = jest.fn()
        manager.add(() => manager.clear())
        manager.add(remaining)

        expect(() => manager.notify()).not.toThrow()
        expect(remaining).not.toHaveBeenCalled()
        expect(manager.getSize()).toBe(0)

        manager.add(remaining)
        manager.notify()
        expect(remaining).toHaveBeenCalledTimes(1)
    })
})
