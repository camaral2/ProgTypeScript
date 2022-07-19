import { faker } from '@faker-js/faker';


import User from '@exmpl/api/models/user'
import database from '@exmpl/utils/database'
import exp from 'constants';

beforeAll(async () => {
    await database.open()
})

afterAll(async () => {
    await database.close()
})

describe('Save of register', () => {
    it('Should create user', async () => {
        const email = faker.internet.email()
        const password = faker.internet.password()
        const name = faker.name.findName()
        const before = Date.now()

        const user = new User({ email: email, password: password, name: name })
        await user.save()

        const after = Date.now()
        const fetched = await User.findById(user._id)

        expect(fetched).not.toBeNull()
        expect(fetched!.email).toBe(email)
        expect(fetched!.name).toBe(name)
        expect(fetched!.password).not.toBe(password) //to validate that the password was saved encrypted

        expect(before).toBeLessThanOrEqual(fetched!.created.getTime())
        expect(fetched!.created.getTime()).toBeLessThanOrEqual(after)
    })

    it('Should update user', async ()=>{
        const nameOld = faker.name.findName()
        const nameNew = faker.name.findName()

        const userInsert = new User({email: faker.internet.email(), password: faker.internet.password(), name: nameOld})
        const dbUserInsert = await userInsert.save()

        dbUserInsert.name = nameNew;

        const dbuserUpdate = await dbUserInsert.save()
        expect(dbuserUpdate.name).toEqual(nameNew)
    })

    it('Should not save user with invalid email', async () => {
        const userInsert = new User({email: 'kf@d.d', password: faker.internet.password(), name: faker.name.findName()})
        await expect(userInsert.save()).rejects.toThrowError(/do not match email/)
    })

    it('Should not save user without an email', async () => {
        const userInsert = new User({password: faker.internet.password(), name: faker.name.findName()})
        await expect(userInsert.save()).rejects.toThrowError(/`email` is required/)
    })

    it('Should not save user without a password', async () => {
        const userInsert = new User({email: faker.internet.email(), name: faker.name.findName()})
        await expect(userInsert.save()).rejects.toThrowError(/`password` is required/)
    })

    it('Should not save user without a name', async () => {
        const userInsert = new User({email: faker.internet.email(), password: faker.internet.password()})
        await expect(userInsert.save()).rejects.toThrowError(/`name` is required/)
    })

    it('Should not save user with the same email', async ()=> {
        const userData = new User({email: faker.internet.email(), password: faker.internet.password(), name: faker.name.findName()})
        const firtUser = new User(userData)
        const secoundUser = new User(userData)
    
        await firtUser.save()
        await expect(secoundUser.save()).rejects.toThrowError(/duplicate key error collection/)
    })

    it('Should not save password in a readable', async ()=> {
        const password = faker.internet.password()
        const userDataFirt = new User({email: faker.internet.email(), password: password, name: faker.name.findName()})
        const userDataSecond = new User({email: faker.internet.email(), password: password, name: faker.name.findName()})
        
        await userDataFirt.save()
        expect(userDataFirt.password).not.toBe(password)

        await userDataSecond.save()
        expect(userDataSecond.password).not.toBe(password)

        expect(userDataFirt.password).not.toBe(userDataSecond.password)
    })
})

describe('Compare Password', () =>{
    it('Should return true for valid password', async ()=>{
        const password = faker.internet.password();
        const user = new User({email: faker.internet.email(), password: password, name: faker.name.findName()})

        await user.save()

        expect(await user.comparePassword(password)).toBe(true)
    })

    it('Should return false for invalid password', async ()=>{
        const password = faker.internet.password();
        const outherPassword = faker.internet.password();
        const user = new User({email: faker.internet.email(), password: password, name: faker.name.findName()})

        await user.save()

        expect(await user.comparePassword(outherPassword)).toBe(false)
    })

    it('Should return false for invalid password', async ()=>{
        const password = faker.internet.password();
        const newPassword = faker.internet.password();
        const user = new User({email: faker.internet.email(), password: password, name: faker.name.findName()})

        await user.save()
        expect(await user.comparePassword(password)).toBe(true)

        user.password = newPassword
        const userUpdated = await user.save()

        expect(await userUpdated.comparePassword(newPassword)).toBe(true)
        expect(await userUpdated.comparePassword(password)).toBe(false)
    })
})

describe('toJSON', ()=>{
    it('Should return valid toJSON', async ()=>{
        const email = faker.internet.email()
        const password = faker.internet.password()
        const name = faker.name.findName()

        const user = new User({ email: email, password: password, name: name })
        await user.save()      
        
        expect(user.toJSON()).toEqual({email: email, name: name, created: expect.any(Number)})
    })
})