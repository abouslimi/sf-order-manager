/**
 * Created by abouslimi on 2/28/21.
 */

global class JSONSerializer {
    global static Object serialize(Object objet) {
        return JSON.deserializeUntyped(JSON.serialize(objet));
    }
}