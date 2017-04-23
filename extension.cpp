#include "pxt.h"
using namespace pxt;
namespace midi {
    //%
    int frequencyToKey(int frequency) {
        return max(0, min(127, round(log(frequency/440.0)/log(2) * 12 + 69)));
    }
}
